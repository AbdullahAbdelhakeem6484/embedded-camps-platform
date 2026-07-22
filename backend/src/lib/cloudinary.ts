import { v2 as cloudinary } from 'cloudinary';

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
        // Extract the extension BEFORE sanitising (e.g. '.pdf', '.mp4')
        const ext = (originalName || '').match(/\.[^./\\]+$/)?.[0]?.toLowerCase() || '';
        const baseName = originalName
            ? originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '')
            : `file_${timestamp}`;
        // Raw files (PDF, etc.) and explicit PDF images MUST keep their extension in the public_id so
        // Cloudinary serves them with the correct Content-Type header.
        const publicId = (resourceType === 'raw' || ext === '.pdf')
            ? `${folder}/${timestamp}_${baseName}${ext}`
            : `${folder}/${timestamp}_${baseName}`;

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

        uploadStream.on('error', (err) => {
            console.error('[cloudinary] stream write error:', err);
            reject(err);
        });

        // Official Cloudinary v2 approach: write buffer directly to the upload stream
        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(publicId: string, resourceType: ResourceType = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
