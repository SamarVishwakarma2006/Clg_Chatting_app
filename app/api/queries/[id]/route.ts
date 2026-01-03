import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

// GET - Fetch single query with comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Fetching query with ID:", id)
    
    let db
    try {
      db = getDb()
      console.log("[v0] Database connection established")
    } catch (dbError) {
      console.error("[v0] Database initialization error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      )
    }

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

    // Get query document
    console.log("[v0] Attempting to fetch query document:", id)
    const queryDoc = await db.collection("queries").doc(id).get()

    if (!queryDoc.exists) {
      console.log("[v0] Query document not found for ID:", id)
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }
    
    console.log("[v0] Query document found:", queryDoc.id)

    const queryData = queryDoc.data()
    const studentId = queryData?.student_id

    // Get comments for this query
    // Note: If orderBy fails, it might need a Firestore index
    // For now, we'll get comments without orderBy and sort in memory
    let commentsSnapshot
    try {
      commentsSnapshot = await db.collection("comments")
        .where("query_id", "==", id)
        .orderBy("created_at", "asc")
        .get()
    } catch (orderByError) {
      console.warn("[v0] orderBy failed, fetching without orderBy:", orderByError)
      // Fallback: get all comments and sort in memory
      commentsSnapshot = await db.collection("comments")
        .where("query_id", "==", id)
        .get()
    }

    const comments = commentsSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          comment_id: doc.id,
          comment_text: data.comment_text,
          anonymous_name: data.anonymous_name,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        }
      })
      .sort((a, b) => {
        // Sort by created_at in ascending order (oldest first)
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateA - dateB
      })

    const query = {
      query_id: queryDoc.id,
      section: queryData?.section,
      title: queryData?.title,
      description: queryData?.description,
      anonymous_name: queryData?.anonymous_name,
      created_at: queryData?.created_at?.toDate?.()?.toISOString() || queryData?.created_at,
      student_id: studentId,
      is_owner: currentUserId !== null && String(studentId) === String(currentUserId),
    }

    return NextResponse.json({
      query,
      comments,
    })
  } catch (error) {
    console.error("[v0] Fetch query error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error("[v0] Error details:", errorDetails)
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined
      },
      { status: 500 }
    )
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
    const db = getDb()

    // Check if user owns this query
    const queryDoc = await db.collection("queries").doc(id).get()

    if (!queryDoc.exists) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    const queryData = queryDoc.data()
    if (String(queryData?.student_id) !== String(userId)) {
      return NextResponse.json({ error: "Forbidden - You can only delete your own queries" }, { status: 403 })
    }

    // Delete all comments for this query first
    const commentsSnapshot = await db.collection("comments")
      .where("query_id", "==", id)
      .get()
    
    const deleteCommentsPromises = commentsSnapshot.docs.map((doc) => doc.ref.delete())
    await Promise.all(deleteCommentsPromises)

    // Delete query
    await db.collection("queries").doc(id).delete()

    return NextResponse.json({
      success: true,
      message: "Query deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
