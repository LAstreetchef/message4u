// NudeNet API configuration
const NUDENET_API_URL = process.env.NUDENET_API_URL || 'https://nudenet-api.onrender.com';

let isServiceAvailable = false;

// Initialize - check if NudeNet API is available
export async function initializeNSFWModel() {
  try {
    console.log('[NSFW] Checking NudeNet API availability...');
    const response = await fetch(`${NUDENET_API_URL}/health`);
    
    if (response.ok) {
      isServiceAvailable = true;
      console.log('[NSFW] NudeNet API is available');
    } else {
      console.warn('[NSFW] NudeNet API returned non-OK status:', response.status);
    }
  } catch (error: any) {
    console.warn('[NSFW] NudeNet API not reachable:', error.message);
  }
}

export interface NSFWResult {
  isNSFW: boolean;
  predictions: {
    className: string;
    probability: number;
  }[];
  reason?: string;
}

/**
 * Check if an image is NSFW using NudeNet API
 * @param imageBuffer - Buffer containing the image data
 * @param threshold - Probability threshold for NSFW classification (default 0.6)
 * @returns NSFWResult with classification details
 */
export async function checkImageNSFW(
  imageBuffer: Buffer,
  threshold: number = 0.6
): Promise<NSFWResult> {
  if (!isServiceAvailable) {
    throw new Error('NSFW detection service not available');
  }

  try {
    // Create form data with image
    const FormData = (await import('form-data')).default;
    const axios = (await import('axios')).default;
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'upload.jpg',
      contentType: 'image/jpeg',
    });

    // Call NudeNet API using axios (better multipart support)
    const response = await axios.post(`${NUDENET_API_URL}/detect`, formData, {
      headers: formData.getHeaders(),
      validateStatus: () => true, // Don't throw on non-2xx status
    });

    if (response.status !== 200) {
      const errorMsg = response.data?.error || `HTTP ${response.status}`;
      throw new Error(`NudeNet API error: ${errorMsg}`);
    }

    const result = response.data;

    return {
      isNSFW: result.isNSFW,
      predictions: result.detections.map((d: any) => ({
        className: d.label,
        probability: d.confidence,
      })),
      reason: result.reason,
    };
  } catch (error: any) {
    console.error('[NSFW] Error calling NudeNet API:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Check if a file is an image based on MIME type
 */
export function isImageFile(contentType: string): boolean {
  return contentType.startsWith('image/');
}

/**
 * Check if NSFW detection is available
 */
export function isNSFWDetectionAvailable(): boolean {
  return isServiceAvailable;
}
