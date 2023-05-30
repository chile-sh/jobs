import Queue from 'bull'
import { logger } from '@jobs/api-util/logger'
import { bullDefaultConfig } from '../../bull-config'
import { parseDuration, waitFor } from '@jobs/helpers'
import type { AppRouter } from '@jobs/api/src/router'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { getEnvVariable } from '@jobs/api-util/env'
import { JobFullPayload } from './scraper'

const JOBS_THREADS = 2
const QUEUE_END_TIMEOUT = parseDuration('1s')

export const insertQueue = new Queue('insert jobs', bullDefaultConfig)

const apiClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: getEnvVariable('JOBS_API_URL'),
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

  await insertQueue.empty()

  logger.info('cleared queues')

  insertQueue.process(JOBS_THREADS, async function (job) {
    jobsInserted.doing++
    const { info, meta } = job.data as JobFullPayload

    const result = await apiClient.job.insertJob.mutate({
      area: info.area,
      company: info.company,
      cities: meta.city,
      country: { name: meta.country, code: 'n/a' },
      date: new Date(info.date),
      salary: info.salary,
      tags: info.tags,
      title: info.title,
      type: info.type,
      url: info.url,
      description: {
        text: info.description,
        headline: meta.description_headline,
      },
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
        requires_applying_in: info.requiresApplyingIn,
      },
    })
  })

  insertQueue.on('completed', async function () {
    jobsInserted.done++
    logger.info(jobsInserted, 'progress job queue [completed]')

    clearTimeout(checkIfFinishedTimeout)
    checkIfFinishedTimeout = setTimeout(onQueueEnd, QUEUE_END_TIMEOUT)
  })
}
