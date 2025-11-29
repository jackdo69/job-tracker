import multer from 'multer';
import type { Context, Next } from 'hono';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Configure multer for company logo uploads
 * - Memory storage (process buffer before saving)
 * - Single file upload on 'logo' field
 * - 5MB file size limit
 * - Only JPEG, PNG, WebP allowed
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

/**
 * Multer middleware wrapper for Hono
 * Handles single file upload on 'logo' field
 */
export const uploadSingle = upload.single('logo');

/**
 * Hono middleware to handle multer file upload
 * Wraps multer middleware and handles errors
 */
export async function handleFileUpload(c: Context, next: Next) {
  return new Promise<void>((resolve, reject) => {
    uploadSingle(c.req.raw as unknown as ExpressRequest, {} as ExpressResponse, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            reject(new Error('File size exceeds 5MB limit'));
          } else {
            reject(new Error(`Upload error: ${err.message}`));
          }
        } else if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error('Unknown upload error'));
        }
      } else {
        resolve();
      }
    });
  }).then(() => next());
}
