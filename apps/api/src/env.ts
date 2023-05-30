import { validateEnv, port, str } from '@jobs/helpers/env'

export const env = validateEnv({
  REDIS_HOST: str(),
  PORT: port(),
  POSTGRES_HOST: str(),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_DB: str(),
})
