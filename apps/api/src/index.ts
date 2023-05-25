import { validateEnv, envalid } from '@jobs/api-util/env'
import { createFastify } from '@jobs/api-util/server'
import * as pack from '../package.json'
import { createContext } from './context'
import { appRouter } from './router'

validateEnv({
  REDIS_HOST: envalid.str(),
  POSTGRES_HOST: envalid.str(),
  POSTGRES_USER: envalid.str(),
  POSTGRES_PASSWORD: envalid.str(),
  POSTGRES_DB: envalid.str(),
})

createFastify(pack.name, appRouter, createContext)
