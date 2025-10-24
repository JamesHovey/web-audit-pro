import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface ForgotPasswordTempRequestBody {
  username: string;
}

/**
 * TEMPORARY PASSWORD RECOVERY - FOR TESTING ONLY
 * This endpoint returns user passwords for recovery without email.
 * DO NOT USE IN PRODUCTION - Replace with proper email-based reset
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: "This endpoint is disabled in production" },
        { status: 403 }
      )
    }

    const body = await request.json() as ForgotPasswordTempRequestBody
    const { username } = body

    if (!username) {
      return NextResponse.json(
        { error: "Username required" },
        { status: 400 }
      )
    }

    // Normalize username for case-insensitive search
    const normalizedUsername = username.toLowerCase()

    // Find user by normalized username (all usernames stored as lowercase)
    const user = await prisma.user.findUnique({
      where: {
        username: normalizedUsername
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Username not found" },
        { status: 404 }
      )
    }

    // Return plaintext password (TESTING ONLY - very insecure!)
    return NextResponse.json({
      message: "⚠️ TESTING MODE: Password found",
      username: user.username,
      password: user.plaintextPassword || 'Password not available (account created before this feature)',
      warning: "In production, we'll send a password reset email instead.",
      note: "This is a temporary feature for testing without email capability."
    }, { status: 200 })

  } catch (error) {
    console.error("Password recovery error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
