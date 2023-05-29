import Queue from 'bull'
import { logger } from '@jobs/api-util/logger'
import { bullDefaultConfig } from '../../bull-config'
import { parseDuration, waitFor } from '@jobs/helpers'

const JOBS_THREADS = 2
const QUEUE_END_TIMEOUT = parseDuration('1s')

export const insertQueue = new Queue('insert jobs', bullDefaultConfig)

const onQueueEnd = () => {
  console.log('queue end')
}

export const runInsertDb = async () => {
  logger.info('running queue "insert-jobs"')
  const jobsInserted = { doing: 0, done: 0 }
  let checkIfFinishedTimeout: ReturnType<typeof setTimeout>

  await insertQueue.empty()

  logger.info('cleared queues')

  insertQueue.process(JOBS_THREADS, async function (job) {
    jobsInserted.doing++
  })

  insertQueue.on('completed', async function () {
    jobsInserted.done++
    logger.info(jobsInserted, 'progress job queue [completed]')

    clearTimeout(checkIfFinishedTimeout)
    checkIfFinishedTimeout = setTimeout(onQueueEnd, QUEUE_END_TIMEOUT)
  })
}
