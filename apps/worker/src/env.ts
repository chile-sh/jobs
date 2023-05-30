import { validateEnv, envalid } from '@jobs/helpers/env'

export const env = validateEnv({
  PORT: envalid.port(),
  JOBS_SCRAPER_URL: envalid.url(),
  JOBS_API_URL: envalid.url(),
})
