import { validateEnv, envalid } from '@jobs/api-util/env'
import { CronJob } from 'cron'
import { logger } from '@jobs/api-util/logger'
import { run } from './queue'

validateEnv({
  SCRAPER_URL: envalid.url(),
})

logger.info('Starting worker scheduler')
export const cron = new CronJob('0 */8 * * *', run, null, true, 'America/Santiago', null, true)
