// Local filesystem ACL - simplified for non-Replit hosting
import * as fs from 'fs';
import * as path from 'path';

export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

// Store ACL policies in a JSON file alongside uploads
const ACL_STORE_PATH = process.env.UPLOAD_DIR 
  ? path.join(process.env.UPLOAD_DIR, '.acl-policies.json')
  : path.join(process.cwd(), 'uploads', '.acl-policies.json');

function loadAclStore(): Record<string, ObjectAclPolicy> {
  try {
    if (fs.existsSync(ACL_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(ACL_STORE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('Failed to load ACL store:', e);
  }
  return {};
}

function saveAclStore(store: Record<string, ObjectAclPolicy>): void {
  const dir = path.dirname(ACL_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(ACL_STORE_PATH, JSON.stringify(store, null, 2));
}

export async function setObjectAclPolicy(
  filePath: string,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  const store = loadAclStore();
  store[filePath] = aclPolicy;
  saveAclStore(store);
}

export async function getObjectAclPolicy(
  filePath: string,
): Promise<ObjectAclPolicy | null> {
  const store = loadAclStore();
  return store[filePath] || null;
}

export async function canAccessObject({
  userId,
  filePath,
  requestedPermission,
}: {
  userId?: string;
  filePath: string;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(filePath);
  if (!aclPolicy) {
    // Default: allow read for files without explicit ACL
    return requestedPermission === ObjectPermission.READ;
  }

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (aclPolicy.owner === userId) {
    return true;
  }

  for (const rule of aclPolicy.aclRules || []) {
    if (rule.permission === requestedPermission || rule.permission === ObjectPermission.WRITE) {
      return true;
    }
  }

  return false;
}
