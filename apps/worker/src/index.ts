import { validateEnv, envalid } from '@jobs/api-util/env'
import { createFastify } from '@jobs/api-util/server'
import { createContext } from './context'
import { appRouter } from './router'
import * as pack from '../package.json'

//import { CronJob } from 'cron'
//export const cron = new CronJob('0 */8 * * *', run, null, true, 'America/Santiago', null, true)

validateEnv({
  SCRAPER_URL: envalid.url(),
})

createFastify(pack.name, appRouter, createContext)
