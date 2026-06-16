@architecture.md

# Backend — Conferences Providers

## Commandes essentielles

```bash
npm run dev        # Démarrer en mode développement
npm run typecheck  # Vérifier les types
npm run build      # Compiler vers dist/
npm run test       # Lancer les tests unitaires (Vitest)
npm run eval       # Lancer les evals promptfoo
npx promptfoo view # Ouvrir l'UI web des résultats (http://localhost:15500)
```

## Conventions

- Chaque domaine fonctionnel = un fichier dans `src/routes/`
- Chaque plugin partagé = un fichier dans `src/plugins/`, enveloppé avec `fastify-plugin`
- Toujours enregistrer les nouvelles routes dans `src/app.ts`
- Ne pas lire `process.env` hors de `src/index.ts` et `src/app.ts`

## Mistral SDK

```ts
import { Mistral } from "@mistralai/mistralai"; // export nommé, pas default
```

Le package est ESM-only — l'import par défaut (`import Mistral from ...`) ne compile pas.

## ESM

Le projet est en mode ESM (`"type": "module"`). Toujours mettre l'extension `.js` sur les imports relatifs :

```ts
import { buildApp } from './app.js'       // ✅
import { buildApp } from './app'          // ❌ erreur Node16
```

## Collects (src/collects/)

Chaque collect = un dossier `src/collects/<nom>/` avec un fichier TypeScript.

| Collect | Fichier | Pattern |
|---|---|---|
| `getConferences()` | `get-conferences/get-conferences.ts` | Appel LLM simple, JSON |
| `getAllSpeakers()` | `get-all-speakers/get-all-speakers.ts` | Lookup Slack (`@slack/web-api`), pas de LLM |

**Pattern collect simple (LLM) :** appel Mistral avec `responseFormat: { type: "json_object" }`, `temperature: 0.2`, parser la réponse. Voir `get-conferences.ts`.

**Pattern collect Slack :** `client.users.list()` du SDK `@slack/web-api` (token `SLACK_TOKEN`) récupère les membres du workspace, puis pipeline pur : filtrer les membres invalides (bot, `deleted`, `USLACKBOT`), puis `extractSpeakerOrUndefined` (`member.functions.ts`) extrait `{ firstname, lastname, company }` depuis `name` ("prenom.nom") ou en fallback `real_name` ("Prenom Nom") + domaine de l'email, **et** normalise en pascal case via `toPascalCase` (`string.functions.ts`) avant de retourner le `Speaker`. Voir `get-all-speakers.ts` comme référence — toute la logique après l'appel Slack est pure et déterministe, donc testable sans LLM ni eval.

⚠️ `get-all-speakers.ts` réapplique actuellement `applyPascalCaseInSpeaker` après `extractSpeakerOrUndefined`, qui normalise déjà en pascal case — double normalisation redondante (sans impact, `toPascalCase` est idempotent) à nettoyer si l'occasion se présente.

## Tests unitaires (Vitest)

Les TU testent la logique déterministe (fonctions pures, pipeline de filtrage/transformation), pas les appels LLM (ça reste le rôle des evals promptfoo ci-dessous).

**Convention** : fichier de test **co-localisé** avec la source, suffixe `.test.ts` — ex. `src/string.functions.ts` → `src/string.functions.test.ts`.

```ts
import { describe, it, expect } from "vitest";
import { toPascalCase } from "./string.functions.js"; // ⚠️ extension .js (Node16 ESM)

describe("toPascalCase", () => {
  it("capitalizes a single lowercase word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });
});
```

`**/*.test.ts` est exclu de la compilation (`tsconfig.json` → `exclude`) : ces fichiers ne doivent jamais finir dans `dist/`.

```bash
npm run test   # vitest run
```

**Collect avec I/O (Slack, HTTP, …)** : ne mocker que le point d'I/O, laisser tourner réellement les fonctions pures qui en dépendent (ex. `member.functions.ts`, `string.functions.ts` ne sont jamais mockés). Utiliser `vi.hoisted` pour déclarer le mock avant l'import du module testé — voir `get-all-speakers.test.ts` comme référence :

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { usersListMock } = vi.hoisted(() => ({ usersListMock: vi.fn() }));

vi.mock("@slack/web-api", () => ({
  WebClient: vi.fn().mockImplementation(function () {
    // ⚠️ Vitest 4 : `function`/`class`, jamais une arrow function — WebClient
    // est instancié avec `new` dans le code source, et un mock arrow function
    // plante avec "is not a constructor".
    return { users: { list: usersListMock } };
  }),
}));

import { getAllSpeakers } from "./get-all-speakers.js"; // import après le mock

beforeEach(() => {
  usersListMock.mockReset();
});
```

## Evals (promptfoo)

Les evals sont dans `tests/evals/` et utilisent [promptfoo](https://promptfoo.dev/) (TypeScript-natif).

```
tests/evals/
├── get-all-conferences.yaml
├── get-all-conferences-provider.ts
├── get-all-speakers.yaml
└── get-all-speakers-provider.ts
```

**Provider** : doit être une **classe** (pas un objet littéral) car promptfoo l'instancie avec `new`.

**Assertions** : utiliser `throw new Error(message)` pour afficher la raison d'échec dans le terminal. `return { reason }` n'est pas affiché.

**LLM judge** : `mistral:mistral-large-latest` — nécessite `MISTRAL_API_KEY` dans `.env`.

**Rate limit** : `getAllSpeakers` appelle l'API Slack (`users.list`), sujette au rate limit. Toujours tester cet eval avec `--max-concurrency 1` :
```bash
npx promptfoo eval --config tests/evals/get-all-speakers.yaml --max-concurrency 1
```

La CI (`/.github/workflows/evals.yml`) tourne les evals sur chaque push/PR sur `main`. Le secret `MISTRAL_API_KEY` doit être configuré dans GitHub → Settings → Secrets.
