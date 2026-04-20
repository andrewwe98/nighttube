import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getPopularVideos, searchVideos } from "@/lib/youtube"

export async function GET(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const videos = query ? await searchVideos(query) : await getPopularVideos()

    return NextResponse.json({ videos })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to load YouTube videos." },
      { status: 500 },
    )
  }
}
