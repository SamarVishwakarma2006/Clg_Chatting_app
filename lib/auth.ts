import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface JWTPayload {
  userId: number
  email: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export function validateCollegeEmail(email: string): boolean {
  // Check if email ends with college domain
  const collegePatterns = [/@[a-z0-9-]+\.edu$/i, /@[a-z0-9-]+\.ac\.in$/i]

  return collegePatterns.some((pattern) => pattern.test(email))
}
