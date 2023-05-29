import { validateEnv, envalid } from '@jobs/api-util/env'
import { createFastify } from '@jobs/api-util/server'
import { toJson } from '@jobs/db'
import { createContext } from './context'
import { appRouter } from './router'
import { createJob } from './job/job.model'
import { JobData } from './types'

import * as pack from '../package.json'

validateEnv({
  REDIS_HOST: envalid.str(),
  POSTGRES_HOST: envalid.str(),
  POSTGRES_USER: envalid.str(),
  POSTGRES_PASSWORD: envalid.str(),
  POSTGRES_DB: envalid.str(),
})

createFastify(pack.name, appRouter, createContext)

const jobData: JobData = {
  area: 'Software Development',
  cities: 'San Francisco, Austin, New York',
  date: new Date().toDateString(),
  description_headline: 'Software Developer Position',
  description: 'Looking for a skilled software developer...',
  level: 'Mid-Level',
  title: 'Software Developer',
  type: 'FULL_TIME',
  remote_hybrid: true,
  remote_local: false,
  remote_modality: 'Remote',
  remote_temporarily: true,
  remote_zone: null,
  salary_currency: 'USD',
  salary_max: 8000,
  salary_min: 7000,
  salary_unit: 'MONTH',
  salary_type: 'net',
  meta: toJson({
    ext_id: 123,
    user_id: 456,
    url: 'https://joblink.com',
    allows_quick_apply: true,
    applications: null,
    hidden: false,
    is_hot: true,
    pinned: false,
    recommended: true,
    lastChecked: null,
    github_required: false,
    linkedin_required: false,
    portfolio_required: false,
    repliesIn: null,
    requiresApplyingIn: null,
  }),
}

createJob(jobData, { name: 'Amazon', logo: 'amazon.jpg', slug: 'amazon' }, { name: 'United States', code: 'US' })
