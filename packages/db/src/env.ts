import { cleanEnv, str } from '@jobs/helpers/env'

export const env = cleanEnv(process.env, {
  POSTGRES_HOST: str(),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_DB: str({ default: 'jobs' }),
})
