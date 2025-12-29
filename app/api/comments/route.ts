import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { generateAnonymousName } from "@/lib/anonymous-names"
import { DATABASE_URL } from "@/lib/db"

// POST - Add comment to query
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Comment POST request received")

    // Verify authentication
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header present:", !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No valid auth header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { userId } = await verifyToken(token)
    console.log("[v0] User ID from token:", userId)

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { query_id, comment_text } = body

    // Validate input
    if (!query_id || !comment_text) {
      console.log("[v0] Missing required fields - query_id:", query_id, "comment_text:", comment_text)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate anonymous name
    const anonymousName = generateAnonymousName()
    console.log("[v0] Generated anonymous name:", anonymousName)

    const sql = neon(DATABASE_URL)

    // Check if query exists
    const queries = await sql`
      SELECT query_id FROM queries WHERE query_id = ${query_id}
    `
    console.log("[v0] Query exists:", queries.length > 0)

    if (queries.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    console.log("[v0] Inserting comment into database...")
    const result = await sql`
      INSERT INTO comments (query_id, comment_text, anonymous_name, student_id)
      VALUES (${query_id}, ${comment_text}, ${anonymousName}, ${userId})
      RETURNING comment_id, comment_text, anonymous_name, created_at
    `
    console.log("[v0] Comment inserted successfully:", result[0])

    return NextResponse.json({
      success: true,
      comment: result[0],
    })
  } catch (error) {
    console.error("[v0] Create comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
