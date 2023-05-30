import { validateEnv, envalid } from '@jobs/api-util/env'

export const env = validateEnv({
  POSTGRES_HOST: envalid.str(),
  POSTGRES_USER: envalid.str(),
  POSTGRES_PASSWORD: envalid.str(),
  POSTGRES_DB: envalid.str({ default: 'jobs' }),
})
