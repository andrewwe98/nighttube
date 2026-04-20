import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { findUserByEmail, upsertSavedVideos } from "@/lib/user-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ savedVideos: [] })
    }

    const user = await findUserByEmail(session.user.email)

    return NextResponse.json({
      savedVideos: user?.savedVideos ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to fetch saved videos." },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }

    const body = await request.json()
    const savedVideos = Array.isArray(body.savedVideos) ? body.savedVideos : []

    await upsertSavedVideos(session.user.email, savedVideos)

    return NextResponse.json({ savedVideos })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to sync saved videos." },
      { status: 500 },
    )
  }
}
