let model: any = null;
let nsfwjs: any = null;
let tf: any = null;

// Initialize the model (call once on server start)
export async function initializeNSFWModel() {
  try {
    console.log('[NSFW] Loading dependencies...');
    
    // Dynamic import to avoid ES module issues
    nsfwjs = await import('nsfwjs');
    tf = await import('@tensorflow/tfjs-node');
    
    console.log('[NSFW] Loading model...');
    model = await nsfwjs.load();
    console.log('[NSFW] Model loaded successfully');
  } catch (error) {
    console.error('[NSFW] Failed to load model:', error);
    throw error;
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
 * Check if an image is NSFW
 * @param imageBuffer - Buffer containing the image data
 * @param threshold - Probability threshold for NSFW classification (default 0.6)
 * @returns NSFWResult with classification details
 */
export async function checkImageNSFW(
  imageBuffer: Buffer,
  threshold: number = 0.6
): Promise<NSFWResult> {
  if (!model) {
    throw new Error('NSFW model not initialized. Call initializeNSFWModel() first.');
  }

  try {
    // Decode image from buffer
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);
    
    // Run prediction
    const predictions = await model.classify(imageTensor);
    
    // Clean up tensor to prevent memory leaks
    imageTensor.dispose();

    // Check for NSFW content
    // Categories: Drawing, Hentai, Neutral, Porn, Sexy
    const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
    const nsfwScore = predictions
      .filter(p => nsfwCategories.includes(p.className))
      .reduce((sum, p) => sum + p.probability, 0);

    const isNSFW = nsfwScore >= threshold;
    
    // Find the highest NSFW category
    const nsfwPrediction = predictions
      .filter(p => nsfwCategories.includes(p.className))
      .sort((a, b) => b.probability - a.probability)[0];

    return {
      isNSFW,
      predictions: predictions.map(p => ({
        className: p.className,
        probability: Math.round(p.probability * 100) / 100,
      })),
      reason: isNSFW 
        ? `Detected ${nsfwPrediction?.className} (${Math.round((nsfwPrediction?.probability || 0) * 100)}% confidence)`
        : undefined,
    };
  } catch (error) {
    console.error('[NSFW] Error during classification:', error);
    throw new Error('Failed to analyze image content');
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
  return model !== null;
}
