import { type NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { signToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Initialize Firestore
    let db
    try {
      db = getDb()
    } catch (dbError) {
      console.error("[v0] Firebase initialization error:", dbError)
      return NextResponse.json({ 
        error: "Database configuration missing. Please set FIREBASE_SERVICE_ACCOUNT in your .env.local file." 
      }, { status: 500 })
    }

    // Get user from database
    const usersRef = db.collection("students_auth")
    const userQuery = await usersRef.where("email", "==", email).limit(1).get()

    if (userQuery.empty) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userDoc = userQuery.docs[0]
    const userData = userDoc.data()
    const user = {
      id: userDoc.id,
      email: userData.email,
      hashed_password: userData.hashed_password,
      user_id: userData.user_id, // Get numeric userId from document
    }

    // Verify password
    const isValid = await compare(password, user.hashed_password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.user_id || 0,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.user_id || 0,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
