import { validateEnv, num, port, url } from '@jobs/helpers/env'

export const env = validateEnv({
  GOB_RANGE_START: num({ default: 50 }),
  GOB_RANGE_END: num({ default: 20000 }),
  GOB_RANGE_STEP: num({ default: 50 }),
  PORT: port({ default: 3010 }),
  JOBS_SCRAPER_URL: url({ devDefault: 'http://127.0.0.1:3002/trpc' }),
  JOBS_API_URL: url({ devDefault: 'http://127.0.0.1:3001/trpc' }),
})
