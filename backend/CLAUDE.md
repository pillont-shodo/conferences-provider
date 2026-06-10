@architecture.md

# Backend — Conferences Providers

## Commandes essentielles

```bash
npm run dev        # Démarrer en mode développement
npm run typecheck  # Vérifier les types
npm run build      # Compiler vers dist/
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
| `getAllSpeakers(conferences)` | `get-all-speakers/get-all-speakers.ts` | Tool calling + web scraping |

**Pattern collect simple :** appel Mistral avec `responseFormat: { type: "json_object" }`, `temperature: 0.2`, parser la réponse.

**Pattern collect tool calling (web scraping) :** boucle multi-tour — le LLM appelle `fetch_page(url)`, Node.js scrape avec `axios` + `cheerio`, retourner le texte nettoyé au LLM. Voir `get-all-speakers.ts` comme référence.

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

**Rate limit** : `getAllSpeakers` fait plusieurs appels Mistral (tool calling). Toujours tester cet eval avec `--max-concurrency 1` :
```bash
npx promptfoo eval --config tests/evals/get-all-speakers.yaml --max-concurrency 1
```

La CI (`/.github/workflows/evals.yml`) tourne les evals sur chaque push/PR sur `main`. Le secret `MISTRAL_API_KEY` doit être configuré dans GitHub → Settings → Secrets.
