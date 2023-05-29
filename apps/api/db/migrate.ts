import path from 'node:path'
import { validateEnv } from '@jobs/api-util/env'
import { createMigrator } from '@jobs/db/run-migrations'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const cmd = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: 'direction of the migration',
    choices: ['up', 'down', 'latest'],
  })
  .parseSync()

validateEnv()

const main = async () => {
  const { dir } = cmd

  if (!dir) return

  const migrator = createMigrator(path.join(__dirname, 'migrations'))
  const migrateDir = {
    up: () => migrator.migrate('latest'),
    down: () => migrator.migrate('down'),
    latest: () => migrator.migrate('latest'),
  }[dir as string]

  if (migrateDir) {
    await migrateDir()
    return
  }

  console.log('dir parameter must be up, down, or latest')
}

main()
