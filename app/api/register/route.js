import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import { createUser, findUserByEmail } from "@/lib/user-store"

export async function POST(request) {
  try {
    const body = await request.json()
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 },
      )
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with that email already exists." },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await createUser({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      savedVideos: [],
    })

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to create account." },
      { status: 500 },
    )
  }
}
