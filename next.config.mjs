import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isGithubPages = process.env.GITHUB_ACTIONS === "true"
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || ""
const basePath = isGithubPages && repoName ? `/${repoName}` : ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  outputFileTracingRoot: __dirname,
}

export default nextConfig
