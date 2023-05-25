import { getEnvVariable } from '@jobs/api-util/env'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'
import cors from '@fastify/cors'

export const createFastify = async (
  serverName: string,
  // TODO: use proper types
  router: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  createContext: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  opts: { logger: boolean } = { logger: true }
) => {
  const fastify = Fastify({
    maxParamLength: 5000,
    logger: opts.logger,
  })

  fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { router, createContext },
  })

  fastify.register(cors, {})

  try {
    const port = parseInt(getEnvVariable('PORT'))
    await fastify.listen({ port })
    fastify.log.info({ port }, `Started [${serverName}] microservice`)

    return fastify
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
