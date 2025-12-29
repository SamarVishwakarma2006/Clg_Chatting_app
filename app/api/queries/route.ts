import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { generateAnonymousName } from "@/lib/anonymous-names"
import { DATABASE_URL } from "@/lib/db"

// GET - Fetch queries by section
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section")

    const sql = neon(DATABASE_URL)

    let queries
    if (section) {
      queries = await sql`
        SELECT 
          q.query_id, 
          q.section, 
          q.title, 
          q.description, 
          q.anonymous_name, 
          q.created_at,
          COUNT(c.comment_id)::int as comment_count
        FROM queries q
        LEFT JOIN comments c ON q.query_id = c.query_id
        WHERE q.section = ${section}
        GROUP BY q.query_id
        ORDER BY q.created_at DESC
      `
    } else {
      queries = await sql`
        SELECT 
          q.query_id, 
          q.section, 
          q.title, 
          q.description, 
          q.anonymous_name, 
          q.created_at,
          COUNT(c.comment_id)::int as comment_count
        FROM queries q
        LEFT JOIN comments c ON q.query_id = c.query_id
        GROUP BY q.query_id
        ORDER BY q.created_at DESC
      `
    }

    return NextResponse.json({ queries })
  } catch (error) {
    console.error("[v0] Fetch queries error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new query
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { userId } = await verifyToken(token)

    const { section, title, description } = await request.json()

    // Validate input
    if (!section || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate anonymous name
    const anonymousName = generateAnonymousName()

    const sql = neon(DATABASE_URL)

    const result = await sql`
      INSERT INTO queries (section, title, description, anonymous_name, student_id)
      VALUES (${section}, ${title}, ${description}, ${anonymousName}, ${userId})
      RETURNING query_id, section, title, description, anonymous_name, created_at
    `

    return NextResponse.json({
      success: true,
      query: result[0],
    })
  } catch (error) {
    console.error("[v0] Create query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
