import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { companies, type Company, type NewCompany } from '../db/schema.js';
import { processCompanyLogo, deleteCompanyLogo } from './imageProcessor.js';

/**
 * Create a new company for a user
 *
 * @param userId - User ID who owns the company
 * @param name - Company name
 * @param logoBuffer - Optional logo image buffer
 * @returns Created company
 */
export async function createCompany(
  userId: string,
  name: string,
  logoBuffer?: Buffer
): Promise<Company> {
  const newCompany: NewCompany = {
    userId,
    name: name.trim(),
    logo: null,
  };

  // Insert company first to get ID
  const [company] = await db.insert(companies).values(newCompany).returning();

  if (!company) {
    throw new Error('Failed to create company');
  }

  // Process and save logo if provided
  if (logoBuffer) {
    try {
      const filename = await processCompanyLogo(logoBuffer, company.id);
      const [updatedCompany] = await db
        .update(companies)
        .set({ logo: filename })
        .where(eq(companies.id, company.id))
        .returning();
      if (updatedCompany) {
        return updatedCompany;
      }
    } catch (error) {
      // If logo processing fails, still return company without logo
      console.error('Logo processing failed:', error);
      return company;
    }
  }

  return company;
}

/**
 * Get all companies for a user
 *
 * @param userId - User ID
 * @returns List of companies
 */
export async function getCompaniesByUser(userId: string): Promise<Company[]> {
  return db
    .select()
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(companies.name);
}

/**
 * Get a single company by ID
 * Validates that the company belongs to the user
 *
 * @param id - Company ID
 * @param userId - User ID
 * @returns Company or null if not found or doesn't belong to user
 */
export async function getCompanyById(
  id: string,
  userId: string
): Promise<Company | null> {
  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.userId, userId)))
    .limit(1);

  return company || null;
}

/**
 * Update a company
 * Validates ownership before updating
 *
 * @param id - Company ID
 * @param userId - User ID (for ownership validation)
 * @param name - Optional new name
 * @param logoBuffer - Optional new logo buffer
 * @returns Updated company or null if not found/not owned
 */
export async function updateCompany(
  id: string,
  userId: string,
  name?: string,
  logoBuffer?: Buffer
): Promise<Company | null> {
  // Verify ownership
  const existingCompany = await getCompanyById(id, userId);
  if (!existingCompany) {
    return null;
  }

  const updates: Partial<NewCompany> = {};

  if (name !== undefined) {
    updates.name = name.trim();
  }

  // Process new logo if provided
  if (logoBuffer) {
    try {
      // Delete old logo file if exists
      if (existingCompany.logo) {
        await deleteCompanyLogo(existingCompany.logo);
      }

      // Process and save new logo
      const filename = await processCompanyLogo(logoBuffer, id);
      updates.logo = filename;
    } catch (error) {
      console.error('Logo processing failed during update:', error);
      // Continue with other updates even if logo fails
    }
  }

  // Only update if there are changes
  if (Object.keys(updates).length === 0) {
    return existingCompany;
  }

  const [updatedCompany] = await db
    .update(companies)
    .set(updates)
    .where(eq(companies.id, id))
    .returning();

  return updatedCompany || null;
}

/**
 * Delete a company
 * Validates ownership before deleting
 * Also deletes associated logo file
 *
 * @param id - Company ID
 * @param userId - User ID (for ownership validation)
 * @returns True if deleted, false if not found/not owned
 */
export async function deleteCompany(
  id: string,
  userId: string
): Promise<boolean> {
  // Verify ownership and get logo filename
  const existingCompany = await getCompanyById(id, userId);
  if (!existingCompany) {
    return false;
  }

  // Delete logo file if exists
  if (existingCompany.logo) {
    await deleteCompanyLogo(existingCompany.logo);
  }

  // Delete company from database
  await db.delete(companies).where(eq(companies.id, id));

  return true;
}
