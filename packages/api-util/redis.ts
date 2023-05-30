import Redis from 'ioredis'
import { str, cleanEnv } from '@jobs/helpers/env'

const env = cleanEnv(process.env, {
  REDIS_HOST: str(),
})

export const host = env.REDIS_HOST

export const redis = new Redis({ host })
