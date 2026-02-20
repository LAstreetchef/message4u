// Local filesystem storage - works on Render, Railway, VPS, etc.
import { Response } from "express";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";
import { getBaseUrl } from "./url";

// Configure upload directory
// On Render, try /var/data/uploads (persistent disk), fallback to ./uploads
// Locally, use ./uploads
function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  
  if (process.env.RENDER) {
    // Try persistent disk first
    const persistentDir = "/var/data/uploads";
    try {
      if (!fs.existsSync(persistentDir)) {
        fs.mkdirSync(persistentDir, { recursive: true });
      }
      return persistentDir;
    } catch (err) {
      console.warn(`Could not use persistent disk at ${persistentDir}, falling back to local uploads`);
    }
  }
  
  // Fallback to local uploads directory
  const localDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return localDir;
}

const UPLOAD_DIR = getUploadDir();
console.log(`Using upload directory: ${UPLOAD_DIR}`);

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface LocalFile {
  path: string;
  name: string;
  exists: () => boolean;
  getMetadata: () => { contentType: string; size: number };
  createReadStream: () => fs.ReadStream;
}

function createLocalFile(filePath: string): LocalFile {
  return {
    path: filePath,
    name: path.basename(filePath),
    exists: () => fs.existsSync(filePath),
    getMetadata: () => {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.pdf': 'application/pdf',
        '.json': 'application/json',
        '.txt': 'text/plain',
      };
      return {
        contentType: mimeTypes[ext] || 'application/octet-stream',
        size: stats.size,
      };
    },
    createReadStream: () => fs.createReadStream(filePath),
  };
}

export class ObjectStorageService {
  constructor() {}

  getUploadDir(): string {
    return UPLOAD_DIR;
  }

  async searchPublicObject(filePath: string): Promise<LocalFile | null> {
    const fullPath = path.join(UPLOAD_DIR, "public", filePath);
    if (fs.existsSync(fullPath)) {
      return createLocalFile(fullPath);
    }
    return null;
  }

  async downloadObject(file: LocalFile, res: Response, cacheTtlSec: number = 3600) {
    try {
      const metadata = file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file.path);
      const isPublic = aclPolicy?.visibility === "public";
      
      res.set({
        "Content-Type": metadata.contentType,
        "Content-Length": metadata.size.toString(),
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    // For local storage, we return an internal upload endpoint
    // The actual upload will be handled by a POST endpoint
    const objectId = randomUUID();
    const baseUrl = getBaseUrl();
    return `${baseUrl}/api/upload/${objectId}`;
  }

  async saveUploadedFile(objectId: string, buffer: Buffer, originalName?: string): Promise<string> {
    const uploadsDir = path.join(UPLOAD_DIR, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const ext = originalName ? path.extname(originalName) : '';
    const fileName = `${objectId}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    return `/objects/uploads/${fileName}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<LocalFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const relativePath = objectPath.slice("/objects/".length);
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new ObjectNotFoundError();
    }
    
    return createLocalFile(fullPath);
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // If it's already a local path, return as-is
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }
    
    // Handle legacy URLs or full paths
    try {
      const url = new URL(rawPath);
      if (url.pathname.startsWith("/objects/")) {
        return url.pathname;
      }
    } catch {
      // Not a URL, return as-is
    }
    
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }

    const relativePath = normalizedPath.slice("/objects/".length);
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    
    await setObjectAclPolicy(fullPath, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: LocalFile;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      filePath: objectFile.path,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}
