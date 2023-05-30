import { InsertableTag, Tag } from '@jobs/db/tables'
import { db } from '@jobs/db'

export const findTag = async (tag: string): Promise<Tag | undefined> =>
  db.selectFrom('tag').selectAll().where('tag', '=', tag).executeTakeFirst()

export const createTag = async (tag: InsertableTag) =>
  db.insertInto('tag').values(tag).returning('id').executeTakeFirstOrThrow()
