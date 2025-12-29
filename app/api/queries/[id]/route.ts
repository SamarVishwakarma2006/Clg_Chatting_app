import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { DATABASE_URL } from "@/lib/db"

// GET - Fetch single query with comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = neon(DATABASE_URL)

    const authHeader = request.headers.get("authorization")
    let currentUserId = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const payload = await verifyToken(token)
        currentUserId = payload.userId
        console.log("[v0] Current user ID from token:", currentUserId, "Type:", typeof currentUserId)
      } catch (err) {
        console.log("[v0] Token verification failed:", err)
      }
    }

    // Get query with student_id
    const queries = await sql`
      SELECT query_id, section, title, description, anonymous_name, created_at, student_id
      FROM queries
      WHERE query_id = ${id}
    `

    if (queries.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    const studentId = queries[0].student_id
    console.log("[v0] Query student_id:", studentId, "Type:", typeof studentId)
    console.log("[v0] Comparison:", currentUserId, "===", studentId, "Result:", currentUserId === studentId)

    // Get comments for this query
    const comments = await sql`
      SELECT comment_id, comment_text, anonymous_name, created_at
      FROM comments
      WHERE query_id = ${id}
      ORDER BY created_at ASC
    `

    const query = {
      ...queries[0],
      is_owner: currentUserId !== null && Number(queries[0].student_id) === Number(currentUserId),
    }

    console.log("[v0] Final is_owner value:", query.is_owner)

    return NextResponse.json({
      query,
      comments,
    })
  } catch (error) {
    console.error("[v0] Fetch query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete query (only by creator)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { userId } = await verifyToken(token)

    const { id } = await params
    const sql = neon(DATABASE_URL)

    // Check if user owns this query
    const queries = await sql`
      SELECT student_id FROM queries WHERE query_id = ${id}
    `

    if (queries.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    if (queries[0].student_id !== userId) {
      return NextResponse.json({ error: "Forbidden - You can only delete your own queries" }, { status: 403 })
    }

    // Delete query (comments will be deleted automatically due to CASCADE)
    await sql`
      DELETE FROM queries WHERE query_id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: "Query deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
