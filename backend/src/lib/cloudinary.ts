import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.warn(
        '[cloudinary] WARNING: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET ' +
        'are not set. File uploads will fail. Set these in your Render dashboard environment variables.'
    );
}

cloudinary.config({
    cloud_name: CLOUD_NAME!,
    api_key:    API_KEY!,
    api_secret: API_SECRET!,
    secure: true,
});

type ResourceType = 'image' | 'video' | 'raw' | 'auto';

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param buffer   File buffer from multer memoryStorage
 * @param folder   Cloudinary folder, e.g. 'embeddedcamps/pdfs'
 * @param resourceType  'image' | 'video' | 'raw' (use 'raw' for PDFs)
 * @param originalName  Original filename for public_id
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    resourceType: ResourceType = 'auto',
    originalName?: string,
): Promise<{ url: string; publicId: string; bytes: number }> {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const safeName = originalName
            ? originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '')
            : `file_${timestamp}`;
        const publicId = `${folder}/${timestamp}_${safeName}`;

        console.log(`[cloudinary] uploading ${originalName} → ${publicId} (${resourceType}, ${buffer.length} bytes)`);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                public_id: publicId,
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    console.error('[cloudinary] upload_stream error:', JSON.stringify(error));
                    return reject(new Error(error.message || 'Cloudinary upload failed'));
                }
                if (!result) {
                    console.error('[cloudinary] upload_stream: no result returned');
                    return reject(new Error('Cloudinary upload failed: no result'));
                }
                console.log(`[cloudinary] upload success → ${result.secure_url}`);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                });
            },
        );

        // Pipe buffer as Readable stream — more reliable than uploadStream.end(buffer)
        uploadStream.on('error', (err) => {
            console.error('[cloudinary] stream write error:', err);
            reject(err);
        });
        Readable.from(buffer).pipe(uploadStream);
    });
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(publicId: string, resourceType: ResourceType = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
