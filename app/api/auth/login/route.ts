import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { compare } from "bcryptjs"
import { signToken } from "@/lib/auth"
import { DATABASE_URL } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!DATABASE_URL) {
      console.error("[v0] DATABASE_URL is not configured")
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const sql = neon(DATABASE_URL)

    // Get user from database
    const users = await sql`
      SELECT id, email, hashed_password 
      FROM students_auth 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValid = await compare(password, user.hashed_password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

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
