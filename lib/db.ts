/**
 * Database configuration for Firebase Firestore
 * 
 * This module exports the Firestore database instance.
 * The actual initialization is handled in lib/firebase.ts
 */

import { getDb } from "./firebase"

// Export Firestore database instance
export { getDb }

// For backward compatibility, export as DATABASE_URL check
export function isDatabaseConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT
}
