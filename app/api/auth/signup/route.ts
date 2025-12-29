import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { hash } from "bcryptjs"
import { validateCollegeEmail, signToken } from "@/lib/auth"
import { DATABASE_URL } from "@/lib/db"

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

    if (!DATABASE_URL) {
      console.error("[v0] DATABASE_URL is not configured")
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const sql = neon(DATABASE_URL)

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM students_auth WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Insert new user
    const result = await sql`
      INSERT INTO students_auth (email, hashed_password)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email
    `

    const user = result[0]

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
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
