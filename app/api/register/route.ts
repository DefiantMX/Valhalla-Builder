import { NextResponse } from "next/server"
import crypto from "crypto"

// This is a mock user database. In a real application, you'd use a proper database.
const users: any[] = []

export async function POST(request: Request) {
  const { username, email, password } = await request.json()

  // Check if user already exists
  if (users.find((user) => user.email === email)) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 })
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString("hex")

  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
    verified: false,
    verificationToken,
  }
  users.push(newUser)

  // Send verification email (mock function)
  await sendVerificationEmail(email, verificationToken)

  return NextResponse.json(
    { message: "User registered. Please check your email to verify your account." },
    { status: 201 },
  )
}

// Mock function to send verification email
async function sendVerificationEmail(email: string, token: string) {
  console.log(`Sending verification email to ${email} with token ${token}`)
  // In a real application, you would use an email service to send the actual email
}

