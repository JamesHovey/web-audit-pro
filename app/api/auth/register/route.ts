import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

interface RegisterTempRequestBody {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterTempRequestBody
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Normalize username to lowercase for case-insensitive matching
    const normalizedUsername = username.toLowerCase()

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username: normalizedUsername
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        plaintextPassword: password, // TESTING ONLY - Store plaintext for password recovery
      }
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user

    return NextResponse.json({
      user: {
        id: userWithoutPassword.id,
        username: userWithoutPassword.username
      },
      message: "Account created successfully! Welcome to Web Audit Pro."
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}