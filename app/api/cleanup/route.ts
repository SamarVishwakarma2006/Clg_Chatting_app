import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DATABASE_URL } from "@/lib/db"

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to automatically delete queries older than 7 days
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(DATABASE_URL)

    // Delete queries older than 7 days
    const result = await sql`
      DELETE FROM queries 
      WHERE created_at < NOW() - INTERVAL '7 days'
      RETURNING query_id
    `

    return NextResponse.json({
      success: true,
      deletedCount: result.length,
      message: `Deleted ${result.length} queries older than 7 days`,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
