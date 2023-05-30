import { env } from './env'
import Redis from 'ioredis'

export const host = env.REDIS_HOST

export const redis = new Redis({ host })
