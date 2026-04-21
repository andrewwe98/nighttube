import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isGitHubPages = process.env.GITHUB_ACTIONS === "true"
const basePath = isGitHubPages ? "/nighttube" : ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
