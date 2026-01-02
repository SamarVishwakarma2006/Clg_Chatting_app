import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { validateCollegeEmail, signToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate college email
    if (!validateCollegeEmail(email)) {
      return NextResponse.json({ error: "Only college emails are allowed" }, { status: 403 })
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

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

    // Check if user already exists
    const usersRef = db.collection("students_auth")
    const existingUserQuery = await usersRef.where("email", "==", email).limit(1).get()

    if (!existingUserQuery.empty) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user document
    // Generate a numeric userId (timestamp-based for uniqueness)
    const userId = Date.now() % 1000000000 // Use timestamp modulo to get a reasonable number
    
    const userData = {
      email,
      hashed_password: hashedPassword,
      user_id: userId, // Store numeric userId for JWT compatibility
      created_at: new Date(),
    }

    const userRef = await usersRef.add(userData)
    const userDoc = await userRef.get()
    const userData_result = userDoc.data()

    // Generate JWT token
    const token = await signToken({
      userId,
      email: userData_result?.email,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email: userData_result?.email,
      },
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
