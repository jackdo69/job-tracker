import sharp from 'sharp';
import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

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

    console.log('📸 Uploading to Supabase Storage:', {
      bucket: STORAGE_BUCKET,
      filename,
      originalBufferSize: buffer.length,
      processedBufferSize: processedBuffer.length,
      contentType: 'image/jpeg',
      upsert: true
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, processedBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      console.error('❌ Supabase upload failed with detailed error:');
      console.error('Error object:', JSON.stringify(uploadError, null, 2));
      console.error('Error keys:', Object.keys(uploadError));
      console.error('Error name:', uploadError.name);
      console.error('Error message:', uploadError.message);
      console.error('Error cause:', uploadError.cause);
      console.error('Error stack:', uploadError.stack);

      // Try to extract additional error details if they exist
      const errorRecord = uploadError as unknown as Record<string, unknown>;
      if ('statusCode' in errorRecord) {
        console.error('Error statusCode:', errorRecord.statusCode);
      }
      if ('error' in errorRecord) {
        console.error('Error error:', errorRecord.error);
      }

      console.error('Full error object stringified:', JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2));

      throw new Error(`Failed to upload to Supabase Storage: ${uploadError.message || JSON.stringify(uploadError)}`);
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    console.log('📍 Public URL:', data.publicUrl);

    return data.publicUrl;
  } catch (error) {
    console.error('🔥 processCompanyLogo caught error:', error);
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
