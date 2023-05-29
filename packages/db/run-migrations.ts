import * as path from 'path'
import { promises as fs } from 'fs'
import { Migrator, FileMigrationProvider } from 'kysely'
import { db } from '@jobs/db'

export function createMigrator(migrationFolder: string) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder,
    }),
  })

  return {
    async migrate(dir: 'up' | 'down' | 'latest' = 'up') {
      if (!dir) throw Error('missing parameter "dir"')

      const migrateDir = {
        up: () => migrator.migrateUp(),
        down: () => migrator.migrateDown(),
        latest: () => migrator.migrateToLatest(),
      }[dir]

      const { error, results } = await migrateDir()

      results?.forEach(it => {
        if (it.status === 'Success') {
          console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
          console.error(`failed to execute migration "${it.migrationName}"`)
        }
      })

      if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
      }

      await db.destroy()
    },
  }
}
