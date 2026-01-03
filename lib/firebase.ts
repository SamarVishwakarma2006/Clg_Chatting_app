/**
 * Firebase Admin SDK initialization for server-side operations
 * 
 * This module initializes Firebase Admin SDK for use in API routes.
 * It uses service account credentials from environment variables.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore, Timestamp } from "firebase-admin/firestore"

let app: App | undefined
let db: Firestore | undefined

/**
 * Initialize Firebase Admin SDK
 * Returns the Firestore database instance
 */
export function getFirebaseAdmin(): Firestore {
  // Return existing instance if already initialized
  if (db) {
    return db
  }

  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    db = getFirestore(app)
    return db
  }

  // Initialize Firebase Admin
  try {
    // Get service account from environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

    if (!serviceAccount) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT environment variable is not set.\n" +
        "Please provide your Firebase service account JSON as a string.\n" +
        "Get it from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key"
      )
    }

    // Parse service account JSON
    let serviceAccountObj
    try {
      serviceAccountObj = JSON.parse(serviceAccount)
      
      // Ensure private_key has proper newlines (convert \n to actual newlines)
      if (serviceAccountObj.private_key && typeof serviceAccountObj.private_key === 'string') {
        serviceAccountObj.private_key = serviceAccountObj.private_key.replace(/\\n/g, '\n')
      }
    } catch (parseError) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT must be valid JSON.\n" +
        "Please check your environment variable configuration.\n" +
        "Make sure the entire JSON object is on a single line or properly escaped."
      )
    }

    // Validate required fields
    if (!serviceAccountObj.project_id) {
      throw new Error("Service account JSON is missing 'project_id' field")
    }

    // Initialize Firebase Admin with service account
    app = initializeApp({
      credential: cert(serviceAccountObj),
      projectId: serviceAccountObj.project_id,
    })

    db = getFirestore(app)
    
    // Set Firestore settings for better performance
    db.settings({
      ignoreUndefinedProperties: true,
    })

    console.log(`[Firebase] Successfully initialized for project: ${serviceAccountObj.project_id}`)
    return db
  } catch (error) {
    console.error("[Firebase] Initialization error:", error)
    throw error
  }
}

/**
 * Get Firestore database instance
 */
export function getDb(): Firestore {
  return getFirebaseAdmin()
}

/**
 * Verify Firebase connection by performing a test read
 */
export async function verifyFirebaseConnection(): Promise<boolean> {
  try {
    const db = getDb()
    // Try to read a non-existent collection to verify connection
    // This is a lightweight operation that won't fail if collection doesn't exist
    await db.collection("_health_check").limit(1).get()
    return true
  } catch (error) {
    console.error("[Firebase] Connection verification failed:", error)
    return false
  }
}

/**
 * Helper to convert Firestore Timestamp to Date
 */
export function firestoreTimestampToDate(timestamp: Timestamp | Date | string | undefined): Date | null {
  if (!timestamp) return null
  if (timestamp instanceof Date) return timestamp
  if (typeof timestamp === "string") return new Date(timestamp)
  if (timestamp.toDate) return timestamp.toDate()
  return null
}

