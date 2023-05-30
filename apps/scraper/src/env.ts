import { validateEnv, envalid } from '@jobs/api-util/env'

export const env = validateEnv({ GOB_SESSION: envalid.str(), GOB_CSRF_TOKEN: envalid.str() })
