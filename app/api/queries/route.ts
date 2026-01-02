import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { generateAnonymousName } from "@/lib/anonymous-names"
import { getDb } from "@/lib/db"

// GET - Fetch queries by section
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section")

    const db = getDb()
    const queriesRef = db.collection("queries")
    
    let querySnapshot
    if (section) {
      querySnapshot = await queriesRef
        .where("section", "==", section)
        .orderBy("created_at", "desc")
        .get()
    } else {
      querySnapshot = await queriesRef
        .orderBy("created_at", "desc")
        .get()
    }

    // Get all queries and their comment counts
    const queries = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data()
        const commentsRef = db.collection("comments")
        const commentsSnapshot = await commentsRef
          .where("query_id", "==", doc.id)
          .get()
        
        return {
          query_id: doc.id,
          section: data.section,
          title: data.title,
          description: data.description,
          anonymous_name: data.anonymous_name,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          comment_count: commentsSnapshot.size,
        }
      })
    )

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

    const db = getDb()
    const queriesRef = db.collection("queries")

    // Convert userId to string for Firestore
    const studentId = String(userId)

    const queryData = {
      section,
      title,
      description,
      anonymous_name: anonymousName,
      student_id: studentId,
      created_at: new Date(),
    }

    const docRef = await queriesRef.add(queryData)
    const doc = await docRef.get()
    const queryData_result = doc.data()

    return NextResponse.json({
      success: true,
      query: {
        query_id: doc.id,
        section: queryData_result?.section,
        title: queryData_result?.title,
        description: queryData_result?.description,
        anonymous_name: queryData_result?.anonymous_name,
        created_at: queryData_result?.created_at?.toDate?.()?.toISOString() || queryData_result?.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Create query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
