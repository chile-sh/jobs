import { InsertableTag, Tag } from '@jobs/db/tables'
import { db } from '@jobs/db'

export const findTag = async (tag: string): Promise<Tag | undefined> =>
  db.selectFrom('tag').selectAll().where('tag', '=', tag).executeTakeFirst()

export const createTag = async (tag: InsertableTag) =>
  db.insertInto('tag').values(tag).returning('id').executeTakeFirstOrThrow()

export const getTagsByJobIds = async (jobIds: number[]) => {
  return db
    .selectFrom('job_tag as jt')
    .where('jt.job_id', 'in', jobIds)
    .innerJoin('tag as t', 't.id', 'jt.tag_id')
    .select(['t.id', 't.tag', 't.description', 'job_id'])
    .execute()
}
