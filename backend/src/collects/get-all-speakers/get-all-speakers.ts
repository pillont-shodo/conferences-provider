import { Mistral } from "@mistralai/mistralai";
import type {
  AssistantMessage,
  ChatCompletionRequestMessage,
  Tool,
} from "@mistralai/mistralai/models/components";
import axios from "axios";
import * as cheerio from "cheerio";

export interface Speaker {
  firstname: string;
  lastname: string;
  company: string;
}

async function fetchCleanHTML(url: string): Promise<string> {
  console.log(`Fetching URL: ${url}`);
  try {
    const { data: html } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(html);
    $("script, style, nav, footer, iframe, noscript").remove();
    return $("body").text().replace(/\s+/g, " ").trim();
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : "unknown";
    return `[ERREUR] Impossible de récupérer la page (HTTP ${status}). Essaie une autre URL.`;
  }
}

const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "fetch_page",
      description: "Fetches and cleans the text content of a web page",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL of the speakers page to scrape" },
        },
        required: ["url"],
      },
    },
  },
];

function isShodoSpeaker(speaker: Speaker): boolean {
  return speaker.company.toLowerCase().includes("shodo");
}

async function fetchSpeakersForConference(
  client: Mistral,
  conference: string
): Promise<Speaker[]> {
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content:
        "Tu es un assistant expert en conférences tech françaises. " +
        "Utilise fetch_page pour trouver les speakers d'une conférence selon cette stratégie :\n" +
        "STRATÉGIE 1 — Page speakers dédiée : cherche une URL de type /speakers, /intervenants, /speakers-<année>. " +
        "Si fetch_page retourne du contenu avec des noms de speakers → extrais-les.\n" +
        "STRATÉGIE 2 — Fallback programme : si fetch_page retourne [ERREUR] ou si la page ne contient pas de liste de speakers, " +
        "cherche la page programme/agenda/schedule/talks de la DERNIÈRE édition. " +
        "Extrais les speakers depuis les sessions/talks listées.\n" +
        "Retourne UNIQUEMENT en JSON valide : " +
        '{ "speakers": [{ "firstname": "prénom", "lastname": "nom", "company": "société" }] } ' +
        "Extrait TOUS les speakers avec leur société exacte telle qu'écrite sur la page. Ne filtre pas.",
    },
    {
      role: "user",
      content:
        `Conférence : ${conference}\n` +
        "1. Trouve et fetche la page speakers (ex: /speakers, /intervenants).\n" +
        "   - Si la page existe et contient des speakers → retourne-les.\n" +
        "2. Si fetch_page retourne [ERREUR] ou aucun speaker trouvé :\n" +
        "   - Cherche la page programme de la dernière édition (ex: /agenda, /schedule, /program, /talks).\n" +
        "   - Extrais les speakers listés dans les sessions/talks.",
    },
  ];

  while (true) {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      temperature: 0.2,
      maxTokens: 4096,
      responseFormat: { type: "json_object" },
      tools,
      messages,
    });

    const choice = response.choices?.[0];
    if (!choice) throw new Error(`No response from Mistral for ${conference}`);

    if (choice.finishReason === "tool_calls") {
      const message = choice.message as AssistantMessage;
      messages.push({ role: "assistant", toolCalls: message.toolCalls, content: message.content });

      for (const call of message.toolCalls ?? []) {
        const args =
          typeof call.function.arguments === "string"
            ? (JSON.parse(call.function.arguments) as { url: string })
            : (call.function.arguments as { url: string });
        const content = await fetchCleanHTML(args.url);
        messages.push({ role: "tool", content, toolCallId: call.id });
      }
    } else {
      const content = choice.message?.content;
      if (typeof content !== "string") throw new Error("Unexpected response format from Mistral");
      const { speakers }: { speakers: Speaker[] } = JSON.parse(content);
      return speakers;
    }
  }
}

export async function getAllSpeakers(conferences: string[]): Promise<Speaker[]> {
  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  const allSpeakers: Speaker[] = [];
  for (let i = 0; i < conferences.length; i += 3) {
    const batch = conferences.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map((c) => fetchSpeakersForConference(client, c))
    );
    for (const result of results) {
      if (result.status === "fulfilled") allSpeakers.push(...result.value);
    }
  }

  const shodo = allSpeakers.filter(isShodoSpeaker);

  const seen = new Map<string, Speaker>();
  for (const s of shodo) {
    const key = `${s.firstname.toLowerCase()}_${s.lastname.toLowerCase()}`;
    if (!seen.has(key)) seen.set(key, s);
  }
  return [...seen.values()];
}
