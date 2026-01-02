import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

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

    const db = getDb()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get all queries older than 7 days
    const queriesSnapshot = await db.collection("queries")
      .where("created_at", "<", sevenDaysAgo)
      .get()

    let deletedCount = 0

    // Delete each query and its comments
    for (const queryDoc of queriesSnapshot.docs) {
      const queryId = queryDoc.id

      // Delete all comments for this query
      const commentsSnapshot = await db.collection("comments")
        .where("query_id", "==", queryId)
        .get()
      
      const deleteCommentsPromises = commentsSnapshot.docs.map((doc) => doc.ref.delete())
      await Promise.all(deleteCommentsPromises)

      // Delete the query
      await queryDoc.ref.delete()
      deletedCount++
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} queries older than 7 days`,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
