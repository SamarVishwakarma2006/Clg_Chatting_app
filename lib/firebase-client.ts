/**
 * Firebase Client SDK initialization for client-side operations
 * 
 * This module initializes Firebase Client SDK for use in React components.
 * It uses Firebase config from environment variables.
 * 
 * Note: This is optional and only needed if you want to use Firebase features
 * directly in client components (e.g., real-time listeners, client-side auth).
 */

"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

/**
 * Get Firebase client app instance
 */
export function getFirebaseClientApp(): FirebaseApp {
  if (app) {
    return app
  }

  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    return app
  }

  // Get Firebase config from environment variables
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Check if config is provided
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
      "[Firebase Client] Firebase client config is not fully set up.\n" +
      "This is optional and only needed for client-side Firebase features.\n" +
      "Your app will work fine using only the Admin SDK on the server."
    )
    // Return a minimal app even without full config
    // This prevents errors but won't enable Firebase features
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  return app
}

/**
 * Get Firestore database instance (client-side)
 */
export function getFirestoreClient(): Firestore {
  if (db) {
    return db
  }

  const app = getFirebaseClientApp()
  db = getFirestore(app)
  return db
}

/**
 * Get Firebase Auth instance (client-side)
 */
export function getFirebaseAuth(): Auth {
  if (auth) {
    return auth
  }

  const app = getFirebaseClientApp()
  auth = getAuth(app)
  return auth
}

