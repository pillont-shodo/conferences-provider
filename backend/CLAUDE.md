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

## Evals (promptfoo)

Les evals sont dans `tests/evals/` et utilisent [promptfoo](https://promptfoo.dev/) (TypeScript-natif).

```
tests/evals/
├── promptfooconfig.yaml   # config des assertions
└── provider.ts            # custom provider — appelle getConferences() directement
```

**Provider** : doit être une **classe** (pas un objet littéral) car promptfoo l'instancie avec `new`.

**Assertions** : utiliser `throw new Error(message)` pour afficher la raison d'échec dans le terminal. `return { reason }` n'est pas affiché.

**LLM judge** : `mistral:mistral-large-latest` — nécessite `MISTRAL_API_KEY` dans `.env`.

La CI (`/.github/workflows/evals.yml`) tourne les evals sur chaque push/PR sur `main`. Le secret `MISTRAL_API_KEY` doit être configuré dans GitHub → Settings → Secrets.
