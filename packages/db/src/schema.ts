import { InferModel } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, serial, uniqueIndex, timestamp, varchar } from 'drizzle-orm/pg-core'

// ================================================================
// Job Sources
export const jobSources = pgTable(
  'job_sources',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    slug: varchar('slug', { length: 50 }).notNull(),
    url: varchar('url').notNull(),
    createdAt: timestamp('created').defaultNow(),
  },
  jobSources => {
    return {
      urlIndex: uniqueIndex('job_sources_url_uniq_idx').on(jobSources.url),
    }
  }
)

export type JobSource = InferModel<typeof jobSources>
export type NewJobSource = InferModel<typeof jobSources, 'insert'>

// ================================================================
// Job History
export const jobHistory = pgTable('job_history', {
  id: serial('id').primaryKey(),
  archiveData: jsonb('archive_data').notNull(),
  sourceId: integer('source_id')
    .references(() => jobSources.id)
    .notNull(),
  version: integer('version').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export type JobHistory = InferModel<typeof jobHistory>
export type NewJobHistory = InferModel<typeof jobHistory, 'insert'>

// ================================================================
// Job Versions
export const jobVersions = pgTable('job_versions', {
  id: serial('id').primaryKey(),
  version: integer('version').notNull(),
  sourceId: integer('source_id')
    .references(() => jobSources.id)
    .notNull(),
  duration: integer('duration'),
  errors: integer('errors'),
  totalJobs: integer('total_jobs'),
  taskStartedAt: timestamp('task_started_at').notNull(),
  taskFinishedAt: timestamp('task_finished_at').notNull(),
})

export type JobVersion = InferModel<typeof jobVersions>
export type NewJobVersion = InferModel<typeof jobVersions, 'insert'>

// ================================================================
// Tags
export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),
    tag: varchar('tag', { length: 50 }).notNull(),
    description: varchar('description', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  tags => {
    return {
      tagIndex: uniqueIndex('tags_tag_uniq_idx').on(tags.tag),
    }
  }
)

export type Tag = InferModel<typeof tags>
export type NewTag = InferModel<typeof tags, 'insert'>

// ================================================================
// Companies
export const companies = pgTable(
  'companies',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    logo: varchar('logo').notNull(),
    locations: jsonb('locations'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  companies => {
    return {
      slugIndex: uniqueIndex('companies_slug_uniq_idx').on(companies.slug),
    }
  }
)

export type Company = InferModel<typeof companies>
export type NewCompany = InferModel<typeof companies, 'insert'>

// ================================================================
// Countries
export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 80 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  countries => {
    return {
      nameIdx: uniqueIndex('countries_name_uniq_idx').on(countries.name),
    }
  }
)

export type Country = InferModel<typeof countries>
export type NewCountry = InferModel<typeof countries, 'insert'>

// ================================================================
// Cities
export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    country_id: integer('country_id')
      .references(() => countries.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    created_at: timestamp('created_at').defaultNow(),
  },
  cities => {
    return {
      cityCountryIdx: uniqueIndex('cities_name_uniq_idx').on(cities.country_id, cities.name),
    }
  }
)

export type City = InferModel<typeof cities>
export type NewCity = InferModel<typeof cities, 'insert'>

// ================================================================
// Job
export const jobs = pgTable(
  'jobs',
  {
    id: serial('id').primaryKey(),
    source_id: integer('source_id')
      .references(() => jobSources.id)
      .notNull(),
    company_id: integer('company_id')
      .references(() => companies.id)
      .notNull(),
    area: varchar('area').notNull(),
    url: varchar('url').notNull(),
    date: timestamp('date'),
    description: varchar('description').notNull(),
    level: varchar('level').notNull(),
    places: jsonb('places'),
    remote_hybrid: boolean('remote_hybrid'),
    remote_local: boolean('remote_local'),
    remote_modality: varchar('remote_modality'),
    remote_temporarily: boolean('remote_temporarily'),
    remote_zone: varchar('remote_zone'),
    title: varchar('title').notNull(),
    type: varchar('type').notNull(),
    salary_guess: boolean('salary_guess').default(false),
    salary_min: integer('salary_min'),
    salary_max: integer('salary_max'),
    salary_type: varchar('salary_type', { length: 20 }),
    salary_unit: varchar('salary_unit', { length: 20 }),
    salary_currency: varchar('salary_currency', { length: 10 }),
    meta: jsonb('meta'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  jobs => {
    return {
      urlIndex: uniqueIndex('jobs_url_uniq_idx').on(jobs.url),
    }
  }
)

export type Job = InferModel<typeof jobs>
export type NewJob = InferModel<typeof jobs, 'insert'>

// ================================================================
// Job Cities
export const jobCities = pgTable(
  'job_city',
  {
    id: serial('id').primaryKey(),
    city_id: integer('city_id')
      .references(() => cities.id)
      .notNull(),
    job_id: integer('job_id')
      .references(() => jobs.id)
      .notNull(),
    enabled: boolean('enabled').default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  jobCities => {
    return {
      jobCityIndex: uniqueIndex('job_city_uniq_idx').on(jobCities.job_id, jobCities.city_id),
    }
  }
)

export type JobCity = InferModel<typeof jobCities>
export type NewJobCity = InferModel<typeof jobCities, 'insert'>

// ================================================================
// Job Tags
export const jobTags = pgTable(
  'job_tags',
  {
    id: serial('id').primaryKey(),
    tag_id: integer('tag_id')
      .references(() => tags.id)
      .notNull(),
    job_id: integer('job_id')
      .references(() => jobs.id)
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  jobTags => {
    return {
      jobTagIndex: uniqueIndex('job_tags_uniq_idx').on(jobTags.job_id, jobTags.tag_id),
    }
  }
)

export type JobTag = InferModel<typeof jobTags>
export type NewJobTag = InferModel<typeof jobTags, 'insert'>
