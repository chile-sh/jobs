import { CronJob } from 'cron'
import { logger } from '@jobs/api-util/logger'
import { getonbrd } from './queues'

logger.info('Starting worker scheduler')
export const cron = new CronJob('0 */8 * * *', getonbrd.runAll, null, true, 'America/Santiago', null, true)
