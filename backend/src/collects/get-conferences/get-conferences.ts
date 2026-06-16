import { Mistral } from "@mistralai/mistralai";
import { Conference } from "./conference.js";

export async function getConferences(): Promise<Conference[]> {

  const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    temperature: 0.2,
    maxTokens: 1024,
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant expert en écosystème tech français. " +
          "Tu réponds UNIQUEMENT en JSON valide. " +
          'Le format attendu est : { "conferences": ["nom1", "nom2", ...] }',
      },
      {
        role: "user",
        content:
           "Liste les noms des conférences tech où des membres " +
          "du groupe Shodo (shodo.io, ESN Software Craft) ont " +
          "effectivement donné des talks. Regarde les conférences internationales et " +
          "inclus aussi toutes les conférences régionales françaises " +
          "(DevFest de chaque ville, Agile Tour de chaque ville, " +
          "JUGs de chaque ville, Techs de chaque ville, Human Talks de chaque ville, etc.). " +
          "Retourne uniquement les noms, sans ville ni description.\n\n" +
          "Exemples de conférences moins connues à ne pas oublier : " +
          "Human Talks Nantes, Touraine Tech, Riviera DEV.",
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Unexpected response format from Mistral");
  const { conferences }: { conferences: string[] } = JSON.parse(content);
  return conferences.map((name) => ({ name }));
}
