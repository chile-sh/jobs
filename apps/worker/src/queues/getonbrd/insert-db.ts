import { logger } from '@jobs/api-util/logger'
import { parseDuration } from '@jobs/helpers'
import type { AppRouter } from '@jobs/api/src/router'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { JobFullPayload } from './scraper'
import { insertQueue } from './queues'
import { env } from '../../env'
import { redis } from '@jobs/api-util/redis'
import { Job } from '@jobs/scraper/src/types'
import superjson from 'superjson'

const JOBS_THREADS = 1
const QUEUE_END_TIMEOUT = parseDuration('20s')

const apiClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: env.JOBS_API_URL,
    }),
  ],
})

const onQueueEnd = () => {
  console.log('queue end')
}

export const runInsertDb = async () => {
  logger.info('running queue "insert-jobs"')
  const jobsInserted = { doing: 0, done: 0 }
  let checkIfFinishedTimeout: ReturnType<typeof setTimeout>

  logger.info('cleared queues')

  insertQueue.process(JOBS_THREADS, async function (job) {
    jobsInserted.doing++
    const { info, salaryRange } = job.data as JobFullPayload
    const jobPath = info.url.replace('https://www.getonbrd.com', '')

    const metaFromCache = await redis.hget('jobs:meta-cache', jobPath)
    if (!metaFromCache) return job.moveToFailed({ message: `couldn't find meta cache: ${jobPath}` })

    const meta: Job = JSON.parse(metaFromCache)

    const result = await apiClient.job.insertJob.mutate({
      source: 'getonbrd',
      area: info.area,
      company: info.company,
      date: new Date(info.date),
      salary: info?.salary?.currency
        ? info.salary
        : salaryRange
        ? {
            currency: 'USD',
            min: salaryRange[0],
            max: salaryRange.at(-1) as number,
            type: 'gross',
            unit: 'MONTH',
            guess: true,
          }
        : undefined,
      tags: info.tags,
      title: info.title,
      type: info.type,
      url: info.url,
      description: info.description,
      level: info.level,
      remote: {
        local: meta.remote_local,
        modality: meta.remote_modality,
        temporarily: meta.temporarily_remote,
        hybrid: meta.hybrid,
        zone: meta.remote_zone,
      },
      meta: {
        allows_quick_apply: meta.allows_quick_apply,
        ext_id: meta.id,
        location_objects: meta.location_objects,
        locations_to_sentence: meta.locations_to_sentence,
        github_required: meta.github_required,
        hidden: meta.hidden,
        is_hot: meta.is_hot,
        linkedin_required: meta.linkedin_required,
        pinned: meta.pinned,
        portfolio_required: meta.portfolio_required,
        recommended: meta.recommended,
        user_id: meta.user_id,
        applications: info.applications,
        last_checked: info.lastChecked,
        replies_in: info.repliesIn,
        perks: meta.perks,
        requires_applying_in: info.requiresApplyingIn,
      },
      places: meta.locations_to_sentence.split(/,\s?|\sor\s/).map(s => s.trim()),
      placesArr: meta.location_objects.map(obj => ({
        cities: obj.sentence.split(/,\s?|\sor\s/).map(s => s.trim()),
        country: obj.tenant_name.trim(),
      })),
    })
  })

  insertQueue.on('failed', job => {
    logger.error(job.data, job.failedReason)
  })

  insertQueue.on('completed', async function () {
    jobsInserted.done++
    logger.info(jobsInserted, 'progress insert job queue [completed]')

    clearTimeout(checkIfFinishedTimeout)
    checkIfFinishedTimeout = setTimeout(onQueueEnd, QUEUE_END_TIMEOUT)
  })
}
