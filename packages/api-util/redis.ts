import { getEnvVariable } from '@jobs/api-util/env'
import Redis from 'ioredis'

export const host = getEnvVariable('REDIS_HOST')

export const redis = new Redis({ host })
