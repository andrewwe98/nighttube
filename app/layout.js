import "./globals.css"

import { Providers } from "@/components/providers"

export const metadata = {
  title: "NightTube",
  description: "A cinematic Next.js video platform with authentication and saved videos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
