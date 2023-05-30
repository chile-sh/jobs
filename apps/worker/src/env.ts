import { validateEnv, envalid } from '@jobs/api-util/env'

export const env = validateEnv({
  JOBS_SCRAPER_URL: envalid.url(),
  JOBS_API_URL: envalid.url(),
})
