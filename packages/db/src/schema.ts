import { InferModel, relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  uniqueIndex,
  timestamp,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core'

// ================================================================
// Job Sources
export const jobSources = pgTable(
  'jobs_sources',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    slug: varchar('slug', { length: 50 }).notNull(),
    url: varchar('url').notNull(),
    createdAt: timestamp('created').defaultNow(),
  },
  jobSources => {
    return {
      urlIndex: uniqueIndex('jobs_sources_url_uniq_idx').on(jobSources.url),
    }
  }
)

export type JobSource = InferModel<typeof jobSources>
export type NewJobSource = InferModel<typeof jobSources, 'insert'>

// ================================================================
// Job History
export const jobHistory = pgTable('jobs_history', {
  id: serial('id').primaryKey(),
  archiveData: jsonb('archive_data').notNull(),
  sourceId: integer('source_id')
    .references(() => jobSources.id)
    .notNull(),
  version: integer('version').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const jobHistoryRelations = relations(jobHistory, ({ many, one }) => ({
  source: one(jobSources, {
    fields: [jobHistory.sourceId],
    references: [jobSources.id],
  }),
}))

export type JobHistory = InferModel<typeof jobHistory>
export type NewJobHistory = InferModel<typeof jobHistory, 'insert'>

// ================================================================
// Job Versions
export const jobVersions = pgTable('jobs_versions', {
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

export const tagsRelations = relations(tags, ({ many }) => ({
  jobsToTags: many(jobsToTags),
}))

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
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => {
    return {
      nameIdx: uniqueIndex('countries_name_uniq_idx').on(t.name),
    }
  }
)

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
}))

export type Country = InferModel<typeof countries>
export type NewCountry = InferModel<typeof countries, 'insert'>

// ================================================================
// Cities
export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .references(() => countries.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  t => {
    return {
      cityCountryIdx: uniqueIndex('cities_name_uniq_idx').on(t.countryId, t.name),
    }
  }
)

export const citiesRelations = relations(cities, ({ one, many }) => ({
  countries: one(countries, { fields: [cities.countryId], references: [countries.id] }),
  jobsToCities: many(jobsToCities),
}))

export type City = InferModel<typeof cities>
export type NewCity = InferModel<typeof cities, 'insert'>

// ================================================================
// Job
export const jobs = pgTable(
  'jobs',
  {
    id: serial('id').primaryKey(),
    sourceId: integer('source_id')
      .references(() => jobSources.id)
      .notNull(),
    companyId: integer('company_id')
      .references(() => companies.id)
      .notNull(),
    area: varchar('area').notNull(),
    url: varchar('url').notNull(),
    date: timestamp('date'),
    description: varchar('description').notNull(),
    level: varchar('level').notNull(),
    places: jsonb('places'),
    remoteHybrid: boolean('remote_hybrid'),
    remoteLocal: boolean('remote_local'),
    remoteModality: varchar('remote_modality'),
    remoteTemporarily: boolean('remote_temporarily'),
    remoteZone: varchar('remote_zone'),
    title: varchar('title').notNull(),
    type: varchar('type').notNull(),
    salaryGuess: boolean('salary_guess').default(false),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    salaryType: varchar('salary_type', { length: 20 }),
    salaryUnit: varchar('salary_unit', { length: 20 }),
    salaryCurrency: varchar('salary_currency', { length: 10 }),
    meta: jsonb('meta'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  jobs => {
    return {
      urlIndex: uniqueIndex('jobs_url_uniq_idx').on(jobs.url),
    }
  }
)

export const jobsRelations = relations(jobs, ({ many, one }) => ({
  jobsToTags: many(jobsToTags),
  jobsToCities: many(jobsToCities),
  source: one(jobSources, {
    fields: [jobs.sourceId],
    references: [jobSources.id],
  }),
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
}))

export type Job = InferModel<typeof jobs>
export type NewJob = InferModel<typeof jobs, 'insert'>

// ================================================================
// Jobs to Cities
export const jobsToCities = pgTable(
  'jobs_to_city',
  {
    cityId: integer('city_id')
      .references(() => cities.id)
      .notNull(),
    jobId: integer('job_id')
      .references(() => jobs.id)
      .notNull(),
    enabled: boolean('enabled').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  jobCities => {
    return {
      pk: primaryKey(jobCities.jobId, jobCities.cityId),
    }
  }
)

export const jobsToCitiesRelations = relations(jobsToCities, ({ one }) => ({
  city: one(cities, {
    fields: [jobsToCities.cityId],
    references: [cities.id],
  }),
  job: one(jobs, {
    fields: [jobsToCities.jobId],
    references: [jobs.id],
  }),
}))

export type JobToCity = InferModel<typeof jobsToCities>
export type NewJobToCity = InferModel<typeof jobsToCities, 'insert'>

// ================================================================
// Job Tags
export const jobsToTags = pgTable(
  'jobs_to_tags',
  {
    tagId: integer('tag_id')
      .references(() => tags.id)
      .notNull(),
    jobId: integer('job_id')
      .references(() => jobs.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => {
    return {
      pk: primaryKey(t.jobId, t.tagId),
    }
  }
)

export const jobsToTagsRelations = relations(jobsToTags, ({ one }) => ({
  tag: one(tags, {
    fields: [jobsToTags.tagId],
    references: [tags.id],
  }),
  job: one(jobs, {
    fields: [jobsToTags.jobId],
    references: [jobs.id],
  }),
}))

export type JobToTag = InferModel<typeof jobsToTags>
export type NewJobToTag = InferModel<typeof jobsToTags, 'insert'>
