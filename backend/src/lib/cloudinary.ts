import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
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

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                public_id: publicId,
                overwrite: true,
            },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                });
            },
        );

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
