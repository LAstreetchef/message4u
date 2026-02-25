/**
 * E2E Encryption for Secret Message
 * Uses Web Crypto API - AES-GCM 256-bit
 * Key is derived from URL fragment, never sent to server
 */

// Generate a random encryption key
export async function generateKey(): Promise<string> {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return bufferToBase64Url(key);
}

// Encrypt content with key
export async function encrypt(plaintext: string, keyString: string): Promise<string> {
  const key = await importKey(keyString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return bufferToBase64Url(combined);
}

// Decrypt content with key
export async function decrypt(encryptedData: string, keyString: string): Promise<string> {
  const key = await importKey(keyString);
  const combined = base64UrlToBuffer(encryptedData);
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

// Encrypt a file
export async function encryptFile(file: File, keyString: string): Promise<Blob> {
  const key = await importKey(keyString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );
  
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return new Blob([combined], { type: 'application/octet-stream' });
}

// Decrypt a file
export async function decryptFile(encryptedBlob: Blob, keyString: string, originalType: string): Promise<Blob> {
  const key = await importKey(keyString);
  const combined = new Uint8Array(await encryptedBlob.arrayBuffer());
  
  // Extract IV and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new Blob([decrypted], { type: originalType });
}

// Import key from base64url string
async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64UrlToBuffer(keyString);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Base64URL encoding (URL-safe, no padding)
function bufferToBase64Url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

// Extract key from URL hash
export function getKeyFromUrl(): string | null {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return null;
  return hash.slice(1); // Remove the #
}

// Check if content is encrypted (has key in URL)
export function isEncryptedLink(): boolean {
  return !!getKeyFromUrl();
}
