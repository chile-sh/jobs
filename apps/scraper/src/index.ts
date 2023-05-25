import { validateEnv, envalid } from '@jobs/api-util/env'
import { createFastify } from '@jobs/api-util/server'
import { createContext } from './context'
import { appRouter } from './router'
import * as pack from '../package.json'

validateEnv({ GOB_SESSION: envalid.str(), GOB_CSRF_TOKEN: envalid.str() })

createFastify(pack.name, appRouter, createContext)
