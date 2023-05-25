import { Kysely, sql } from 'kysely'

// TODO: use proper types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('company')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'varchar', col => col.notNull())
    .addColumn('slug', 'varchar', col => col.notNull().unique())
    .addColumn('logo', 'varchar', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('country')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'varchar', col => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('job')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('company_id', 'integer', col => col.references('company.id').notNull())
    .addColumn('country_id', 'integer', col => col.references('country.id').notNull())
    .addColumn('area', 'varchar', col => col.notNull())
    .addColumn('cities', 'varchar')
    .addColumn('date', 'timestamptz')
    .addColumn('description_headline', 'varchar', col => col.notNull())
    .addColumn('description', 'varchar', col => col.notNull())
    .addColumn('level', 'varchar', col => col.notNull())
    .addColumn('tags', 'jsonb')
    .addColumn('title', 'varchar', col => col.notNull())
    .addColumn('type', 'varchar', col => col.notNull())
    .addColumn('remote', 'jsonb')
    .addColumn('salary', 'jsonb')
    .addColumn('meta', 'jsonb')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()
}

// TODO: use proper types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('job').execute()
  await db.schema.dropTable('country').execute()
}
