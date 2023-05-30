import { validateEnv, str, port } from '@jobs/helpers/env'

export const env = validateEnv({
  PORT: port(),
  GOB_SESSION: str(),
  GOB_CSRF_TOKEN: str(),
})
