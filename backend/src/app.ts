import Fastify, { FastifyInstance } from 'fastify'
import sensiblePlugin from './plugins/sensible.js'
import healthRoute from './routes/health.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  })

  await app.register(sensiblePlugin)
  await app.register(healthRoute)

  return app
}
