import { db, eq, inArray, NewTag, jobsToTags, tags } from '@jobs/db'

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
      jobIds: jobsToTags.jobId,
    })
    .from(jobsToTags)
    .where(inArray(jobsToTags.jobId, jobIds))
    .innerJoin(tags, eq(jobsToTags.tagId, tags.id))
    .execute()
}
