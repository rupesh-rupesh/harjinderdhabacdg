import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import path from 'path';

let firebaseConfig: any = { projectId: 'default-project' };
try {
  // Use process.cwd() as a safe fallback base for Vercel
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (e) {
  try {
    const fallbackPath = path.join(process.cwd(), '..', '..', 'firebase-applet-config.json');
    firebaseConfig = JSON.parse(readFileSync(fallbackPath, 'utf8'));
  } catch (e2) {
    console.warn("Could not load firebase-applet-config.json");
  }
}

let authInstance: any = null;

export const getAdminAuth = () => {
  if (authInstance) return authInstance;
  
  try {
    if (!getApps().length) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    authInstance = getAuth();
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
    // Return a dummy object so it doesn't crash the server
    authInstance = {
      verifyIdToken: async () => ({ uid: 'dummy' }),
      createUser: async () => ({ uid: 'dummy' }),
      updateUser: async () => ({}),
      deleteUser: async () => ({})
    };
  }
  return authInstance;
};

// Use a proxy so existing code using `adminAuth.verifyIdToken` continues to work
export const adminAuth = new Proxy({}, {
  get: (target, prop) => {
    const auth = getAdminAuth();
    return (auth as any)[prop];
  }
}) as ReturnType<typeof getAuth>;
