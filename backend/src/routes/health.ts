import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

export default fp(async function (app: FastifyInstance) {
  app.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  })
}, {
  name: 'health-route',
})
