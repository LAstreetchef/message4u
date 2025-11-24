import type { Request } from 'express';

/**
 * Gets the base URL for the application based on environment variables.
 * Uses the following precedence:
 * 1. REPLIT_APP_URL (production/published deployment)
 * 2. REPLIT_DEV_DOMAIN (hosted development)
 * 3. REPLIT_DOMAINS (fallback)
 * 4. localhost:5000 (local development when REPL_ID is absent)
 * 5. Optionally falls back to req.protocol + req.host if provided
 * 
 * @param opts Optional options object with req parameter for fallback
 * @returns The base URL without trailing slash (e.g., "https://secretmessage4u.com")
 * @throws Error if no valid base URL can be determined
 */
export function getBaseUrl(opts?: { req?: Request }): string {
  let baseUrl = '';
  
  // Try environment variables first (preferred for published deployments)
  if (process.env.REPLIT_APP_URL) {
    try {
      const url = new URL(process.env.REPLIT_APP_URL);
      baseUrl = url.origin;
    } catch {
      baseUrl = process.env.REPLIT_APP_URL.replace(/\/$/, '');
    }
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  } else if (process.env.REPLIT_DOMAINS) {
    const domain = process.env.REPLIT_DOMAINS.split(',')[0]?.trim();
    baseUrl = domain ? `https://${domain}` : '';
  } else if (!process.env.REPL_ID) {
    // Local development (not running on Replit)
    baseUrl = 'http://localhost:5000';
  } else if (opts?.req) {
    // Fallback to request headers if available
    const protocol = opts.req.protocol;
    const host = opts.req.get('host');
    if (protocol && host) {
      baseUrl = `${protocol}://${host}`;
    }
  }
  
  if (!baseUrl) {
    const error = 'Unable to determine base URL - check REPLIT_APP_URL, REPLIT_DEV_DOMAIN, or REPLIT_DOMAINS environment variables';
    console.error(error);
    throw new Error(error);
  }
  
  // Normalize: remove trailing slash
  return baseUrl.replace(/\/$/, '');
}
