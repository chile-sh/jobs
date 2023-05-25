import Queue from 'bull'
import parse from 'parse-duration'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { getEnvVariable } from '@jobs/api-util/env'
import { host as redisHost, redis } from '@jobs/api-util/redis'
import type { AppRouter } from '@jobs/scraper/src/router'
import { logger } from '@jobs/api-util/logger'

const SALARY_STEP = 50
const JOBS_THREADS = 5
const CACHE_TTL = parse('4 hours', 'sec')

const bullDefaultConfig = { redis: { host: redisHost } }

const navQueue = new Queue('fetch salaries', bullDefaultConfig)
const jobQueue = new Queue('fetch jobs', bullDefaultConfig)
const rangeQueue = new Queue('salary range', bullDefaultConfig)

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getEnvVariable('SCRAPER_URL'),
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
  const cached = await redis.hget('jobs:cache', cacheKey)
  if (cached) return JSON.parse(cached)

  const jobsList = await client.filter.query({ salary: [from, to], offset, remote })

  redis.hset('jobs:cache', cacheKey, JSON.stringify(jobsList))
  return jobsList
}

export const getJobInfo = async (path: string): Promise<ReturnType<typeof client.getJob.query>> => {
  const cached = await redis.hget('jobs:info-cache', path)
  if (cached) return JSON.parse(cached)

  const jobInfo = await client.getJob.query(path)

  redis.hset('jobs:info-cache', path, JSON.stringify(jobInfo))
  return jobInfo
}

const makeRange = (from = 50, to = 20000, step = SALARY_STEP) => {
  const items = []

  for (let i = from; i <= to; i += step) {
    items.push(i)
  }

  return items
}

const JOB_Q_CONFIG: Queue.JobOptions = { removeOnComplete: true, attempts: 5 }

export const run = async () => {
  logger.info('running job "get-jobs"')
  const jobsCompleted = { nav: 0, info: 0 }
  const jobsAdded = { nav: 0, info: 0 }
  const setTTL = { nav: false, info: false }

  await jobQueue.empty()
  await navQueue.empty()
  await rangeQueue.empty()

  logger.info('cleared queues')

  rangeQueue.process(async function (range) {
    for (const num of range.data) {
      navQueue.add({ num, offset: 0, remote: true }, JOB_Q_CONFIG)
      jobsAdded.nav++
      navQueue.add({ num, offset: 0, remote: false }, JOB_Q_CONFIG)
      jobsAdded.nav++
    }
  })

  navQueue.process(JOBS_THREADS, async function (job) {
    const data: { num: number; offset: number; remote: boolean } = job.data
    const min = data.num - SALARY_STEP > 0 ? data.num - SALARY_STEP : data.num
    const res = await getJobsFromSalaryRange(min, data.num, data.offset, data.remote)

    for (const job of res.jobs) {
      const currVal = await redis.hget('jobs:salaryRange', job.url)
      const arr = currVal ? [...JSON.parse(currVal), data.num] : [data.num]
      await redis.hset('jobs:salaryRange', job.url, JSON.stringify(arr))
    }

    if (res.meta.jobs_count) {
      navQueue.add({ num: data.num, offset: data.offset + res.meta.jobs_limit, remote: data.remote }, JOB_Q_CONFIG)
      jobsAdded.nav++
    }
  })

  jobQueue.process(JOBS_THREADS, async function (job) {
    const data: { path: string; salaryRange: number[] } = job.data
    const info = await getJobInfo(data.path)
    logger.info(info.url, 'job queue url')
  })

  jobQueue.on('completed', async function () {
    jobsCompleted.info++

    logger.info({ jobsCompleted, jobsAdded }, 'progress job queue [completed]')

    if (jobsCompleted.info === jobsAdded.info) {
      logger.info('All jobQueue jobs have been processed.')
    }

    if (!setTTL.info) {
      await redis.expire('jobs:cache', CACHE_TTL)
      await redis.expire('jobs:info-cache', CACHE_TTL)
      setTTL.info = true
    }
  })

  navQueue.on('completed', async () => {
    jobsCompleted.nav++

    logger.info({ jobsCompleted, jobsAdded }, 'nav queue [completed]')

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

        jobQueue.add({ path: url, salaryRange }, JOB_Q_CONFIG)
        jobsAdded.info++
      }

      logger.info('All navQueue jobs have been processed.')
    }
  })

  rangeQueue.add(makeRange(), { removeOnComplete: true })
}
