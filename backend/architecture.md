# Architecture

## Stack

- **Runtime** : Node.js ≥ 20
- **Framework** : [Fastify 5](https://fastify.dev/) — HTTP server performant avec validation intégrée
- **Langage** : TypeScript 6 en mode strict (`module: Node16`, `"type": "module"` — projet ESM)
- **Dev runner** : `tsx watch` (transpilation esbuild, rechargement automatique)

## Structure des dossiers

```
src/
├── index.ts          # Point d'entrée : lit PORT/HOST depuis l'env et démarre le serveur
├── app.ts            # Factory buildApp() — instancie Fastify, enregistre plugins et routes
├── plugins/          # Plugins Fastify partagés (décorateurs globaux)
│   └── sensible.ts   # @fastify/sensible — helpers d'erreurs HTTP (app.httpErrors.*)
└── routes/           # Handlers HTTP, un fichier par domaine fonctionnel
    └── health.ts     # GET /health → { status, timestamp }
```

## Patterns clés

### Split `app.ts` / `index.ts`

`buildApp()` crée et configure l'instance Fastify sans la lier à un port. `index.ts` appelle `buildApp()` puis `app.listen()`. Ce découplage permet aux tests d'appeler `buildApp()` + `app.inject()` sans ouvrir de socket réseau.

### Plugins via `fastify-plugin`

Les plugins enveloppés avec `fp()` **sortent de l'encapsulation Fastify** : leurs décorateurs (ex. `app.httpErrors`) sont disponibles dans toutes les routes. Les plugins sans `fp()` restent isolés dans leur scope.

### Ajout d'une route

Créer `src/routes/<domaine>.ts`, envelopper avec `fp()`, puis enregistrer dans `app.ts` :

```ts
// src/routes/providers.ts
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
// ⚠️ imports relatifs : toujours avec extension .js (Node16 ESM)

export default fp(async function (app: FastifyInstance) {
  app.get('/providers', async () => {
    return []
  })
}, { name: 'providers-route' })
```

```ts
// src/app.ts — ajouter (import avec .js obligatoire)
import providersRoute from './routes/providers.js'
await app.register(providersRoute)
```

### Variables d'environnement

| Variable    | Défaut      | Description                                      |
|-------------|-------------|--------------------------------------------------|
| `PORT`      | `3000`      | Port d'écoute                                    |
| `HOST`      | `0.0.0.0`   | Interface d'écoute                               |
| `LOG_LEVEL` | `info`      | Niveau de log Fastify (fatal/error/warn/info/debug/trace/silent) |

Copier `.env.example` en `.env` pour le développement local.

## Scripts

| Commande          | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Démarre en mode watch (tsx)              |
| `npm run build`   | Compile TypeScript → `dist/`            |
| `npm run start`   | Lance le build compilé                   |
| `npm run typecheck` | Vérifie les types sans émettre de fichiers |
| `npm run eval`    | Lance les evals promptfoo                |
