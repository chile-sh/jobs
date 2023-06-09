import Queue from 'bull'
import { parseDuration } from '@jobs/helpers'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { redis } from '@jobs/api-util/redis'
import type { AppRouter } from '@jobs/scraper/src/router'
import { logger } from '@jobs/api-util/logger'
import { insertQueue, jobQueue, navQueue, rangeQueue } from './queues'
import { AsyncReturnType } from 'type-fest'
import { env } from '../../env'
import superjson from 'superjson'

const SALARY_STEP = 50
const JOBS_THREADS = 5

const CACHE_TTL = parseDuration(env.isProd ? '2 hours' : '1 week', 'sec')

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: env.JOBS_SCRAPER_URL,
    }),
  ],
})

const getJobsFromSalaryRange = async (
  from: number,
  to: number,
  offset: number,
  remote = false
): Promise<ReturnType<typeof client.filter.query>> => {
  const cacheKey = [from, to, offset, remote].join()
  const cached = await redis.hget('jobs:nav-cache', cacheKey)
  if (cached) return JSON.parse(cached)

  const jobsList = await client.filter.query({ salary: [from, to], offset, remote })

  redis.hset('jobs:nav-cache', cacheKey, JSON.stringify(jobsList))
  return jobsList
}

export const getJobInfo = async (path: string): Promise<ReturnType<typeof client.getJob.query>> => {
  const cached = await redis.hget('jobs:info-cache', path)
  if (cached) return JSON.parse(cached)
  const jobInfo = await client.getJob.query(path)

  redis.hset('jobs:info-cache', path, JSON.stringify(jobInfo))
  return jobInfo
}

const makeRange = (from = env.GOB_RANGE_START, to = env.GOB_RANGE_END, step = env.GOB_RANGE_STEP) => {
  const items = []

  for (let i = from; i <= to; i += step) {
    items.push(i)
  }

  return items
}

const JOB_QUEUE_CONFIG: Queue.JobOptions = { removeOnComplete: 10, removeOnFail: 10, attempts: 5 }

export interface JobFullPayload {
  source: string
  info: AsyncReturnType<typeof getJobInfo>
  salaryRange?: number[]
}

export const runScraper = async () => {
  logger.info('running queue "get-jobs"')
  const jobsCompleted = { nav: 0, info: 0 }
  const jobsAdded = { nav: 0, info: 0 }
  const setTTL = { nav: false, info: false }

  logger.info('cleared queues')

  rangeQueue.process(async function (range) {
    for (const num of range.data) {
      navQueue.add({ num, offset: 0, remote: true }, JOB_QUEUE_CONFIG)
      jobsAdded.nav++
      navQueue.add({ num, offset: 0, remote: false }, JOB_QUEUE_CONFIG)
      jobsAdded.nav++
    }
  })

  navQueue.process(JOBS_THREADS, async function (job) {
    const data: { num: number; offset: number; remote: boolean } = job.data
    const min = data.num - SALARY_STEP > 0 ? data.num - SALARY_STEP : data.num
    const res = await getJobsFromSalaryRange(min, data.num, data.offset, data.remote)

    for (const job of res.jobs) {
      await redis.hset('jobs:meta-cache', job.url, JSON.stringify(job))

      const currVal = await redis.hget('jobs:salaryRange', job.url)
      const arr = currVal ? [...JSON.parse(currVal), data.num] : [data.num]
      await redis.hset('jobs:salaryRange', job.url, JSON.stringify(arr))
    }

    if (res.meta.jobs_count) {
      navQueue.add({ num: data.num, offset: data.offset + res.meta.jobs_limit, remote: data.remote }, JOB_QUEUE_CONFIG)
      jobsAdded.nav++
    }
  })

  jobQueue.process(JOBS_THREADS, async function (job) {
    const data: { path: string; salaryRange: number[] } = job.data

    const info = await getJobInfo(data.path)
    const diff = +(data.salaryRange.at(-1) as number) - data.salaryRange[0]
    const salaryNotFound = data.salaryRange[0] === env.GOB_RANGE_START && data.salaryRange.at(-1) === env.GOB_RANGE_END
    const jobInfo: JobFullPayload = {
      source: 'getonbrd',
      info,
      salaryRange: salaryNotFound || diff > env.GOB_RANGE_MAX_DIFF ? undefined : data.salaryRange,
    }

    logger.info(info.url, 'job queue url')
    insertQueue.add(jobInfo, { removeOnComplete: true, removeOnFail: true })
  })

  jobQueue.on('completed', async function () {
    jobsCompleted.info++

    logger.info(jobsCompleted, 'progress fetch job queue [completed]')

    if (jobsCompleted.info === jobsAdded.info) {
      logger.info('All jobQueue jobs have been processed.')
    }

    if (!setTTL.info) {
      await redis.expire('jobs:nav-cache', CACHE_TTL)
      await redis.expire('jobs:meta-cache', CACHE_TTL)
      await redis.expire('jobs:info-cache', CACHE_TTL)
      setTTL.info = true
    }
  })

  navQueue.on('completed', async job => {
    jobsCompleted.nav++

    logger.info({ jobsCompleted }, 'nav queue [completed]')

    if (!setTTL.nav) {
      await redis.expire('jobs:salaryRange', CACHE_TTL)
      setTTL.nav = true
    }

    // Check if all jobs have been completed
    if (jobsCompleted.nav === jobsAdded.nav) {
      const allUrls = await redis.hgetall('jobs:salaryRange')
      for (const [url, values] of Object.entries(allUrls)) {
        const parsed = JSON.parse(values)
        const salaryRange = [Math.min(...parsed), Math.max(...parsed)]

        jobQueue.add({ path: url, salaryRange }, JOB_QUEUE_CONFIG)
        jobsAdded.info++
      }

      logger.info('All navQueue jobs have been processed.')
    }
  })

  rangeQueue.add(makeRange(), { removeOnComplete: true, removeOnFail: true })
}
