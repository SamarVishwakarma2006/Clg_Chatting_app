/**
 * Firebase Setup Verification Script
 * 
 * Run this script to verify your Firebase configuration:
 *   npx tsx scripts/verify-firebase-setup.ts
 * 
 * Or add it to your package.json scripts:
 *   "verify-firebase": "tsx scripts/verify-firebase-setup.ts"
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") })

import { printFirebaseSetupStatus } from "../lib/firebase-setup"

async function main() {
  await printFirebaseSetupStatus()
  process.exit(0)
}

main().catch((error) => {
  console.error("Error running verification:", error)
  process.exit(1)
})

