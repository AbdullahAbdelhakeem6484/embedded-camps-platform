import crypto from 'crypto';
import https from 'https';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

let fontCache: Record<string, Buffer> = {};

function downloadFont(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download font: status code ${res.statusCode}`));
                return;
            }
            const chunks: Buffer[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', (err) => reject(err));
        }).on('error', (err) => reject(err));
    });
}

async function getFont(url: string, name: string): Promise<Buffer> {
    if (fontCache[name]) return fontCache[name];
    try {
        const buffer = await downloadFont(url);
        fontCache[name] = buffer;
        return buffer;
    } catch (err) {
        console.error(`[certificateGenerator] Failed to fetch font ${name}:`, err);
        throw err;
    }
}

/**
 * Generates an unpredictable and unique certificate ID.
 * Format: EC-[8 characters of high-entropy uppercase hex]
 */
export function generateCertificateId(): string {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `EC-${random}`;
}

export interface GenerateCertificateParams {
    studentName: string;
    courseName: string;
    completionDate: Date;
    certificateId: string;
    verificationUrl: string;
    instructorName?: string;
}

/**
 * Generates a premium vector-quality A4 Landscape Certificate in PDF format.
 */
export async function generateCertificatePdf(params: GenerateCertificateParams): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 40,
            });
            const chunks: Buffer[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Try to download beautiful fonts dynamically
            let hasCustomFonts = false;
            try {
                const [regular, bold, cursive] = await Promise.all([
                    getFont('https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/Montserrat-Regular.ttf', 'Montserrat-Regular'),
                    getFont('https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/Montserrat-Bold.ttf', 'Montserrat-Bold'),
                    getFont('https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf', 'GreatVibes-Regular'),
                ]);
                doc.registerFont('Montserrat', regular);
                doc.registerFont('Montserrat-Bold', bold);
                doc.registerFont('Cursive', cursive);
                hasCustomFonts = true;
            } catch (err) {
                console.warn('[certificateGenerator] Falling back to standard Helvetica/Times-Roman fonts:', err);
            }

            const fontRegular = hasCustomFonts ? 'Montserrat' : 'Helvetica';
            const fontBold = hasCustomFonts ? 'Montserrat-Bold' : 'Helvetica-Bold';
            const fontCursive = hasCustomFonts ? 'Cursive' : 'Times-Italic';

            const width = 841.89;
            const height = 595.28;

            // 1. Draw Background
            doc.rect(0, 0, width, height).fill('#ffffff');

            // 2. Draw Decorative Corner Highlights in Gold/Dark Slate
            // Top-left
            doc.moveTo(0, 0).lineTo(180, 0).lineTo(0, 180).closePath().fill('#0f172a');
            doc.moveTo(0, 185).lineTo(185, 0).lineWidth(4).stroke('#d97706');

            // Bottom-right
            doc.moveTo(width, height).lineTo(width - 180, height).lineTo(width, height - 180).closePath().fill('#0f172a');
            doc.moveTo(width, height - 185).lineTo(width - 185, height).lineWidth(4).stroke('#d97706');

            // 3. Draw Gold Double Line Border
            doc.rect(30, 30, width - 60, height - 60).lineWidth(2).stroke('#eab308');
            doc.rect(35, 35, width - 70, height - 70).lineWidth(1).stroke('#d97706');

            // 4. Logo drawing
            const logoX = width / 2;
            const logoY = 65;
            
            // Sun (Yellow circle)
            doc.circle(logoX - 50, logoY, 10).fill('#fbbf24');
            // Tent canopy (Yellow triangle)
            doc.moveTo(logoX - 30, logoY + 15)
               .lineTo(logoX - 10, logoY - 15)
               .lineTo(logoX + 10, logoY + 15)
               .closePath()
               .fill('#fbbf24');
            // Tent entrance (cutout)
            doc.moveTo(logoX - 16, logoY + 15)
               .lineTo(logoX - 10, logoY + 5)
               .lineTo(logoX - 4, logoY + 15)
               .closePath()
               .fill('#ffffff');

            // Logo text
            doc.fillColor('#0f172a')
               .font(fontBold)
               .fontSize(16)
               .text('EMBEDDED', logoX - 40, logoY - 5, { width: 140, align: 'left' });
            doc.fillColor('#d97706')
               .font(fontBold)
               .fontSize(16)
               .text('CAMPS', logoX - 40, logoY + 10, { width: 140, align: 'left' });

            // 5. Title "CERTIFICATE OF COMPLETION"
            doc.fillColor('#0f172a')
               .font(fontBold)
               .fontSize(28)
               .text('CERTIFICATE OF COMPLETION', 0, 160, { width, align: 'center' });

            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(12)
               .text('This is proudly presented to', 0, 205, { width, align: 'center' });

            // 6. Student Full Name (in gold-yellow font or high-contrast deep slate)
            doc.fillColor('#1e293b')
               .font(fontBold)
               .fontSize(34)
               .text(params.studentName.toUpperCase(), 0, 235, { width, align: 'center' });

            // Line under name
            doc.moveTo(width / 2 - 120, 280).lineTo(width / 2 + 120, 280).lineWidth(1.5).stroke('#e2e8f0');

            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(12)
               .text('for successfully completing the advanced specialization course', 0, 295, { width, align: 'center' });

            // 7. Course Title
            doc.fillColor('#b91c1c')
               .font(fontBold)
               .fontSize(22)
               .text(params.courseName, 0, 320, { width, align: 'center' });

            // Date
            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(11)
               .text(`on ${params.completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, 355, { width, align: 'center' });

            // 8. Footer Section
            const footerY = 410;

            // Left side: Dates & Link
            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(9)
               .text('ISSUE DATE', 90, footerY);
            doc.fillColor('#0f172a')
               .font(fontBold)
               .fontSize(11)
               .text(params.completionDate.toLocaleDateString(), 90, footerY + 15);
            doc.fillColor('#d97706')
               .font(fontRegular)
               .fontSize(10)
               .text('embeddedcamps.com', 90, footerY + 35);

            // Center side: Signature & Line
            doc.moveTo(width / 2 - 80, footerY + 20).lineTo(width / 2 + 80, footerY + 20).lineWidth(1).stroke('#94a3b8');
            doc.fillColor('#1e3a8a')
               .font(fontCursive)
               .fontSize(26)
               .text(params.instructorName || 'Abdullah Abdelhakeem', 0, footerY - 12, { width, align: 'center' });
            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(9)
               .text('INSTRUCTOR SIGNATURE', 0, footerY + 28, { width, align: 'center' });

            // Right side: QR Code
            const qrSize = 75;
            const qrX = width - 180;
            const qrY = footerY - 20;

            const qrBuffer = await QRCode.toBuffer(params.verificationUrl, {
                margin: 1,
                width: qrSize,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            });

            doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

            // Verification metadata under QR
            doc.fillColor('#64748b')
               .font(fontRegular)
               .fontSize(8)
               .text('CREDENTIAL ID', qrX - 20, footerY + 60, { width: qrSize + 40, align: 'center' });
            doc.fillColor('#0f172a')
               .font(fontBold)
               .fontSize(9)
               .text(params.certificateId, qrX - 20, footerY + 70, { width: qrSize + 40, align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
