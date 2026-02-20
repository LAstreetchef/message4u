import type { Request } from 'express';

/**
 * Gets the base URL for the application based on environment variables.
 * Uses the following precedence:
 * 1. BASE_URL or APP_URL (explicit configuration)
 * 2. RENDER_EXTERNAL_URL (Render.com)
 * 3. REPLIT_APP_URL (Replit - legacy)
 * 4. localhost:5000 (local development)
 * 5. Optionally falls back to req.protocol + req.host if provided
 * 
 * @param opts Optional options object with req parameter for fallback
 * @returns The base URL without trailing slash (e.g., "https://secretmessage4u.com")
 * @throws Error if no valid base URL can be determined
 */
export function getBaseUrl(opts?: { req?: Request }): string {
  let baseUrl = '';
  
  // Try explicit configuration first
  const explicitUrl = process.env.BASE_URL || process.env.APP_URL || process.env.REPLIT_APP_URL;
  if (explicitUrl) {
    try {
      const url = new URL(explicitUrl);
      baseUrl = url.origin;
    } catch {
      baseUrl = explicitUrl.replace(/\/$/, '');
    }
  } else if (process.env.RENDER_EXTERNAL_URL) {
    // Render.com provides this automatically
    baseUrl = process.env.RENDER_EXTERNAL_URL;
  } else if (process.env.NODE_ENV !== 'production') {
    // Local development
    const port = process.env.PORT || '5000';
    baseUrl = `http://localhost:${port}`;
  } else if (opts?.req) {
    // Fallback to request headers if available
    const protocol = opts.req.protocol;
    const host = opts.req.get('host');
    if (protocol && host) {
      baseUrl = `${protocol}://${host}`;
    }
  }
  
  if (!baseUrl) {
    const error = 'Unable to determine base URL - set BASE_URL or APP_URL environment variable';
    console.error(error);
    throw new Error(error);
  }
  
  // Normalize: remove trailing slash
  return baseUrl.replace(/\/$/, '');
}
