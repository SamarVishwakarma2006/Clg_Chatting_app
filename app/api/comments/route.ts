import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { generateAnonymousName } from "@/lib/anonymous-names"
import { getDb } from "@/lib/db"
import { analyzeTextForToxicity } from "@/lib/perspective"

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

    // Check for toxicity using Google Perspective API
    console.log("[v0] Checking comment for toxicity...")
    const toxicityCheck = await analyzeTextForToxicity({
      text: comment_text,
      threshold: 0.7, // Reject if toxicity score >= 0.7
    })

    if (toxicityCheck.isToxic) {
      console.log("[v0] Comment rejected due to toxicity. Score:", toxicityCheck.toxicityScore)
      return NextResponse.json(
        {
          error: "Your message contains inappropriate content. Please revise your message.",
          toxicityScore: toxicityCheck.toxicityScore,
        },
        { status: 400 }
      )
    }

    if (toxicityCheck.error && process.env.GOOGLE_PERSPECTIVE_API_KEY) {
      // Only log error if API key is configured (don't block if service is down)
      console.error("[v0] Toxicity check error:", toxicityCheck.error)
      // Continue with submission if API is misconfigured but don't block
    }

    console.log("[v0] Comment passed toxicity check. Score:", toxicityCheck.toxicityScore)

    // Generate anonymous name
    const anonymousName = generateAnonymousName()
    console.log("[v0] Generated anonymous name:", anonymousName)

    const db = getDb()

    // Check if query exists
    const queryDoc = await db.collection("queries").doc(query_id).get()
    console.log("[v0] Query exists:", queryDoc.exists)

    if (!queryDoc.exists) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    console.log("[v0] Inserting comment into database...")
    
    const commentData = {
      query_id,
      comment_text,
      anonymous_name: anonymousName,
      student_id: userId.toString(),
      created_at: new Date(),
    }

    const commentRef = await db.collection("comments").add(commentData)
    const commentDoc = await commentRef.get()
    const commentData_result = commentDoc.data()

    console.log("[v0] Comment inserted successfully:", commentDoc.id)

    return NextResponse.json({
      success: true,
      comment: {
        comment_id: commentDoc.id,
        comment_text: commentData_result?.comment_text,
        anonymous_name: commentData_result?.anonymous_name,
        created_at: commentData_result?.created_at?.toDate?.()?.toISOString() || commentData_result?.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Create comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
