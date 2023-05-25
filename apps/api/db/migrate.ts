import path from 'node:path'
import { validateEnv } from '@jobs/api-util/env'
import { createMigrator } from '@jobs/api-util/run-migrations'

validateEnv()

createMigrator(path.join(__dirname, 'migrations')).migrateToLatest()
