import crypto from 'crypto';
import { BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_CDN_URL, BUNNY_TOKEN_SECRET } from '../config';
import logger from './logger';

const STORAGE_BASE = 'https://storage.bunnycdn.com';

export const BunnyStorage = {
    async upload(filePath: string, buffer: Buffer, mimeType: string): Promise<string> {
        const url = `${STORAGE_BASE}/${BUNNY_STORAGE_ZONE}/${filePath}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                AccessKey: BUNNY_STORAGE_API_KEY,
                'Content-Type': mimeType,
            },
            body: buffer as unknown as BodyInit,
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Bunny upload failed [${response.status}]: ${text}`);
        }
        const cdnUrl = `${BUNNY_CDN_URL}/${filePath}`;
        logger.info(`[Bunny] Uploaded: ${cdnUrl}`);
        return cdnUrl;
    },

    async delete(filePath: string): Promise<void> {
        const url = `${STORAGE_BASE}/${BUNNY_STORAGE_ZONE}/${filePath}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { AccessKey: BUNNY_STORAGE_API_KEY },
        });
        if (!response.ok) {
            logger.warn(`[Bunny] Delete failed for ${filePath}: ${response.status}`);
        }
    },
};

export function signedCdnUrl(cdnPath: string, ttlSeconds = 7200): string {
    if (!BUNNY_TOKEN_SECRET || !BUNNY_CDN_URL) {
        return `${BUNNY_CDN_URL}${cdnPath.startsWith('/') ? cdnPath : '/' + cdnPath}`;
    }
    const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
    const hashableBase = `${BUNNY_TOKEN_SECRET}${cdnPath}${expiry}`;
    const token = crypto
        .createHash('md5')
        .update(hashableBase)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return `${BUNNY_CDN_URL}${cdnPath.startsWith('/') ? '' : '/'}${cdnPath}?token=${token}&expires=${expiry}`;
}

export function cdnPathFromUrl(fullUrl: string): string {
    if (!BUNNY_CDN_URL) return fullUrl;
    return fullUrl.replace(BUNNY_CDN_URL, '') || fullUrl;
}
