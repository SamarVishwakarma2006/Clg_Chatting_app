/**
 * Firebase Setup Verification Utility
 * 
 * This utility helps verify that Firebase is properly configured.
 * Run this in development to check your setup.
 */

import { getDb, verifyFirebaseConnection } from "./firebase"

/**
 * Verify Firebase setup and configuration
 */
export async function verifyFirebaseSetup(): Promise<{
  success: boolean
  errors: string[]
  warnings: string[]
  info: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []
  const info: string[] = []

  // Check environment variables
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    errors.push("FIREBASE_SERVICE_ACCOUNT environment variable is not set")
  } else {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      if (!serviceAccount.project_id) {
        errors.push("Service account JSON is missing 'project_id' field")
      } else {
        info.push(`Firebase Project ID: ${serviceAccount.project_id}`)
      }
      if (!serviceAccount.private_key) {
        errors.push("Service account JSON is missing 'private_key' field")
      }
      if (!serviceAccount.client_email) {
        errors.push("Service account JSON is missing 'client_email' field")
      }
    } catch (parseError) {
      errors.push("FIREBASE_SERVICE_ACCOUNT is not valid JSON")
    }
  }

  // Check client-side config (optional)
  const hasClientConfig =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!hasClientConfig) {
    warnings.push(
      "Client-side Firebase config is not set. This is optional and only needed for client-side Firebase features."
    )
  } else {
    info.push("Client-side Firebase config is set")
  }

  // Try to initialize and connect
  if (errors.length === 0) {
    try {
      const db = getDb()
      info.push("Firebase Admin SDK initialized successfully")

      // Verify connection
      const isConnected = await verifyFirebaseConnection()
      if (isConnected) {
        info.push("Firebase connection verified successfully")
      } else {
        warnings.push("Firebase connection verification failed, but initialization succeeded")
      }
    } catch (error) {
      errors.push(
        `Firebase initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    info,
  }
}

/**
 * Print setup verification results to console
 */
export async function printFirebaseSetupStatus(): Promise<void> {
  const result = await verifyFirebaseSetup()

  console.log("\n" + "=".repeat(60))
  console.log("Firebase Setup Verification")
  console.log("=".repeat(60))

  if (result.info.length > 0) {
    console.log("\n✅ Info:")
    result.info.forEach((msg) => console.log(`   ${msg}`))
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:")
    result.warnings.forEach((msg) => console.log(`   ${msg}`))
  }

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:")
    result.errors.forEach((msg) => console.log(`   ${msg}`))
  }

  console.log("\n" + "=".repeat(60))
  if (result.success) {
    console.log("✅ Firebase setup is complete and ready to use!")
  } else {
    console.log("❌ Firebase setup has errors. Please fix them before proceeding.")
  }
  console.log("=".repeat(60) + "\n")
}

