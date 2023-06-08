import { db, eq, inArray, NewTag, jobTags, tags } from '@jobs/db'

export const findTag = async (tag: string) => {
  const [found] = await db.select().from(tags).where(eq(tags.tag, tag)).execute()
  return found
}

export const createTag = async (tag: NewTag) => {
  const [inserted] = await db.insert(tags).values(tag).returning().execute()
  return inserted
}

export const getTagsByJobIds = async (jobIds: number[]) => {
  return db
    .select({
      id: tags.id,
      tag: tags.tag,
      description: tags.description,
      job_id: jobTags.job_id,
    })
    .from(jobTags)
    .where(inArray(jobTags.job_id, jobIds))
    .innerJoin(tags, eq(jobTags.tag_id, tags.id))
    .execute()
}
