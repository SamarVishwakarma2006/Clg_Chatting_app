/**
 * Firebase Admin SDK initialization for server-side operations
 * 
 * This module initializes Firebase Admin SDK for use in API routes.
 * It uses service account credentials from environment variables.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

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
        "FIREBASE_SERVICE_ACCOUNT environment variable is not set. " +
        "Please provide your Firebase service account JSON as a string or use FIREBASE_PROJECT_ID with other credentials."
      )
    }

    // Parse service account JSON
    let serviceAccountObj
    try {
      serviceAccountObj = JSON.parse(serviceAccount)
    } catch (parseError) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT must be valid JSON. " +
        "Please check your environment variable configuration."
      )
    }

    // Initialize Firebase Admin with service account
    app = initializeApp({
      credential: cert(serviceAccountObj),
    })

    db = getFirestore(app)
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

