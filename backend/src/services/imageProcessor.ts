import sharp from 'sharp';
import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

const TARGET_SIZE = 200;
const JPEG_QUALITY = 65;

/**
 * Process and upload company logo to Supabase Storage
 * - Resizes to 200x200px (center crop, square)
 * - Converts to JPEG format
 * - Compresses to target quality
 * - Uploads to Supabase Storage bucket
 *
 * @param buffer - Image buffer
 * @param companyId - Company UUID
 * @returns Public URL of uploaded image
 */
export async function processCompanyLogo(
  buffer: Buffer,
  companyId: string
): Promise<string> {
  logger.info({}, "Process Company logo")
  try {
    const filename = `${companyId}.jpg`;

    // Process image: resize, crop to square, compress
    const processedBuffer = await sharp(buffer)
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();
        logger.info({}, "Sharp completed")

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, processedBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      throw new Error(`Failed to upload to Supabase Storage: ${uploadError.message || JSON.stringify(uploadError)}`);
    }

    logger.debug({uploadData},'✅ Upload successful:' );

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    logger.info({publicUrl: data.publicUrl},'📍 Public URL:' );

    return data.publicUrl;
  } catch (error) {
    logger.error({error},'🔥 processCompanyLogo caught error:' );
    throw new Error(`Failed to process company logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete company logo from Supabase Storage
 *
 * @param logoUrl - Full public URL of the logo
 */
export async function deleteCompanyLogo(logoUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/company-logos/{filename}
    const urlParts = logoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (!filename) {
      console.error('Failed to extract filename from logo URL:', logoUrl);
      return;
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      console.error('Failed to delete logo from Supabase Storage:', error);
    }
  } catch (error) {
    console.error('Failed to delete logo file:', error);
  }
}

/**
 * Check if logo file exists in Supabase Storage
 *
 * @param logoUrl - Full public URL of the logo
 * @returns True if file exists
 */
export async function logoFileExists(logoUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL
    const urlParts = logoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (!filename) {
      return false;
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        search: filename,
      });

    if (error) {
      return false;
    }

    return data.length > 0;
  } catch {
    return false;
  }
}
