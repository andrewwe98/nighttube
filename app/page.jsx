import { auth } from "@/auth"
import { HomeShell } from "@/components/home-shell"

export default async function HomePage() {
  let session = null

  try {
    session = await auth()
  } catch {
    session = null
  }

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  )
  const youtubeEnabled = Boolean(process.env.YOUTUBE_API_KEY)

  return (
    <HomeShell
      googleEnabled={googleEnabled}
      initialSession={session}
      youtubeEnabled={youtubeEnabled}
    />
  )
}
