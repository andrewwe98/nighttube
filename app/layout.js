import "./globals.css"

export const metadata = {
  title: "NightTube",
  description: "A cinematic Next.js video platform with authentication and saved videos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
