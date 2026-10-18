import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a secure cryptographically random token for booking validation
 */
export const generateBookingToken = () => {
  return crypto.randomBytes(24).toString('hex');
};

/**
 * Generate QR code data URL from booking verification payload
 */
export const generateQrDataUrl = async (payload) => {
  try {
    const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const qrDataUrl = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code data URL:', error.message);
    return null;
  }
};
