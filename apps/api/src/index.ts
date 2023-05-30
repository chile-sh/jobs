import { createFastify } from '@jobs/api-util/server'
import { createContext } from './context'
import { appRouter } from './router'

import * as pack from '../package.json'

createFastify(pack.name, appRouter, createContext)
