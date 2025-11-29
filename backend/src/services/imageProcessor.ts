import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads/company-logos');
const TARGET_SIZE = 200;
const JPEG_QUALITY = 65;

/**
 * Process and save company logo
 * - Resizes to 200x200px (center crop, square)
 * - Converts to JPEG format
 * - Compresses to target quality
 * - Saves to uploads/company-logos/{companyId}.jpg
 *
 * @param buffer - Image buffer from multer
 * @param companyId - Company UUID
 * @returns Filename of saved image
 */
export async function processCompanyLogo(
  buffer: Buffer,
  companyId: string
): Promise<string> {
  try {
    const filename = `${companyId}.jpg`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Process image: resize, crop to square, compress
    await sharp(buffer)
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(outputPath);

    return filename;
  } catch (error) {
    throw new Error(`Failed to process company logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete company logo file
 *
 * @param filename - Logo filename to delete
 */
export async function deleteCompanyLogo(filename: string): Promise<void> {
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to delete logo file:', error);
    }
  }
}

/**
 * Check if logo file exists
 *
 * @param filename - Logo filename to check
 * @returns True if file exists
 */
export async function logoFileExists(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
