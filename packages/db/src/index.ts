import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from 'process'

import * as schema from './schema'

export * from './schema'
export * from 'drizzle-orm'

const pool = new Pool({
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
})

export const db = drizzle(pool, { schema })
