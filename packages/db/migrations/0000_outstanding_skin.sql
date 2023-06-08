CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo" varchar NOT NULL,
	"locations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"archive_data" jsonb NOT NULL,
	"source_id" integer NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "jobs_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"url" varchar NOT NULL,
	"created" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "jobs_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"source_id" integer NOT NULL,
	"duration" integer,
	"errors" integer,
	"total_jobs" integer,
	"task_started_at" timestamp NOT NULL,
	"task_finished_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"area" varchar NOT NULL,
	"url" varchar NOT NULL,
	"date" timestamp,
	"description" varchar NOT NULL,
	"level" varchar NOT NULL,
	"places" jsonb,
	"remote_hybrid" boolean,
	"remote_local" boolean,
	"remote_modality" varchar,
	"remote_temporarily" boolean,
	"remote_zone" varchar,
	"title" varchar NOT NULL,
	"type" varchar NOT NULL,
	"salary_guess" boolean DEFAULT false,
	"salary_min" integer,
	"salary_max" integer,
	"salary_type" varchar(20),
	"salary_unit" varchar(20),
	"salary_currency" varchar(10),
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs_to_city" (
	"city_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs_to_city" ADD CONSTRAINT "jobs_to_city_job_id_city_id" PRIMARY KEY("job_id","city_id");

CREATE TABLE IF NOT EXISTS "jobs_to_tags" (
	"tag_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs_to_tags" ADD CONSTRAINT "jobs_to_tags_job_id_tag_id" PRIMARY KEY("job_id","tag_id");

CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(50) NOT NULL,
	"description" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cities_name_uniq_idx" ON "cities" ("country_id","name");
CREATE UNIQUE INDEX IF NOT EXISTS "companies_slug_uniq_idx" ON "companies" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "countries_name_uniq_idx" ON "countries" ("name");
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_sources_url_uniq_idx" ON "jobs_sources" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_url_uniq_idx" ON "jobs" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "tags_tag_uniq_idx" ON "tags" ("tag");
DO $$ BEGIN
 ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_history" ADD CONSTRAINT "jobs_history_source_id_jobs_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "jobs_sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_versions" ADD CONSTRAINT "jobs_versions_source_id_jobs_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "jobs_sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_source_id_jobs_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "jobs_sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_to_city" ADD CONSTRAINT "jobs_to_city_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_to_city" ADD CONSTRAINT "jobs_to_city_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_to_tags" ADD CONSTRAINT "jobs_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobs_to_tags" ADD CONSTRAINT "jobs_to_tags_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
