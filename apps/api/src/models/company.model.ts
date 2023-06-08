import { db, eq, NewCompany, companies } from '@jobs/db'

export const findCompanyByName = async (name: string) => {
  const [company] = await db.select().from(companies).where(eq(companies.name, name)).execute()
  return company
}

export const createCompany = async (company: NewCompany) => {
  const [inserted] = await db
    .insert(companies)
    .values(company)
    .onConflictDoUpdate({ target: companies.slug, set: company })
    .returning()
    .execute()
  return inserted
}
