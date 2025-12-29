import { neonConfig } from "@neondatabase/serverless"

// Enable WebSocket for local development
if (process.env.NODE_ENV === "development") {
  neonConfig.webSocketConstructor = WebSocket
}

// Database connection will use DATABASE_URL from environment variables
export const DATABASE_URL = process.env.DATABASE_URL!
