import { Kysely, sql } from 'kysely'

// TODO: use proper types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tag')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('tag', 'varchar(10)', col => col.notNull().unique())
    .addColumn('description', 'varchar(100)', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('company')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'varchar(50)', col => col.notNull())
    .addColumn('slug', 'varchar(50)', col => col.notNull().unique())
    .addColumn('logo', 'varchar', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('country')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'varchar(80)', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('city')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('country_id', 'integer', col => col.references('country.id').notNull())
    .addColumn('name', 'varchar(100)', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('job')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('company_id', 'integer', col => col.references('company.id').notNull())
    .addColumn('city_id', 'integer', col => col.references('city.id'))
    .addColumn('area', 'varchar', col => col.notNull())
    .addColumn('url', 'varchar', col => col.notNull().unique())
    .addColumn('date', 'timestamptz')
    .addColumn('description', 'varchar', col => col.notNull())
    .addColumn('level', 'varchar', col => col.notNull())
    .addColumn('remote_hybrid', 'boolean')
    .addColumn('remote_local', 'boolean')
    .addColumn('remote_modality', 'varchar')
    .addColumn('remote_temporarily', 'boolean')
    .addColumn('remote_zone', 'varchar')
    .addColumn('title', 'varchar', col => col.notNull())
    .addColumn('type', 'varchar', col => col.notNull())
    .addColumn('remote', 'jsonb')
    .addColumn('salary_guess', 'boolean', col => col.defaultTo(false))
    .addColumn('salary_min', 'integer')
    .addColumn('salary_max', 'integer')
    .addColumn('salary_type', 'varchar(20)')
    .addColumn('salary_unit', 'varchar(20)')
    .addColumn('salary_currency', 'varchar(10)')
    .addColumn('meta', 'jsonb')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute()
}

// TODO: use proper types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tag').execute()
  await db.schema.dropTable('job').execute()
  await db.schema.dropTable('company').execute()
  await db.schema.dropTable('city').execute()
  await db.schema.dropTable('country').execute()
}
