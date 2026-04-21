import "dotenv/config"

import bcrypt from "bcryptjs"
import cors from "cors"
import express from "express"

import { createToken, requireAuth } from "./lib/auth.js"
import { connectToDatabase, users, savedVideos } from "./lib/db.js"
import { getPopularVideos, searchVideos } from "./lib/youtube.js"

const app = express()
const port = process.env.PORT || 4000

// Build allowed origins list: allow FRONTEND_URL, GitHub Pages repo URL, and localhost during development
const allowedOrigins = [process.env.FRONTEND_URL, "https://andrewwe98.github.io", "https://andrewwe98.github.io/nighttube", "https://andrewwe98.github.io/youtube-clone", "http://localhost:3000", "http://localhost:3001", "http://localhost:3004"].filter(Boolean)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl/postman)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      }
      return callback(new Error("CORS policy: Origin not allowed"))
    },
  }),
)
app.use(express.json())

app.get("/api/health", (_request, response) => {
  response.json({ ok: true })
})

app.post("/api/auth/register", async (request, response) => {
  try {
    await connectToDatabase()

    const name = request.body.name?.trim()
    const email = request.body.email?.trim().toLowerCase()
    const password = request.body.password?.trim()

    if (!name || !email || !password) {
      return response.status(400).json({ message: "Name, email, and password are required." })
    }

    const existingUser = users.find(user => user.email === email)

    if (existingUser) {
      return response.status(409).json({ message: "An account with that email already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      savedVideos: [],
    }
    
    users.push(user)

    const token = createToken(user)

    return response.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to create account." })
  }
})

app.post("/api/auth/login", async (request, response) => {
  try {
    await connectToDatabase()

    const email = request.body.email?.trim().toLowerCase()
    const password = request.body.password?.trim()

    const user = users.find(u => u.email === email)

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return response.status(401).json({ message: "Invalid email or password." })
    }

    const token = createToken(user)

    return response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to login." })
  }
})

app.get("/api/saved-videos", requireAuth, async (request, response) => {
  try {
    await connectToDatabase()
    const userVideos = savedVideos.get(request.user.email) || []
    return response.json({ savedVideos: userVideos })
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to fetch saved videos." })
  }
})

app.post("/api/saved-videos", requireAuth, async (request, response) => {
  try {
    await connectToDatabase()
    const newSavedVideos = Array.isArray(request.body.savedVideos) ? request.body.savedVideos : []
    savedVideos.set(request.user.email, newSavedVideos)
    return response.json({ savedVideos: newSavedVideos })
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to save videos." })
  }
})

app.get("/api/youtube/search", requireAuth, async (request, response) => {
  try {
    const query = request.query.q?.toString() || ""
    const videos = query ? await searchVideos(query) : await getPopularVideos()
    return response.json({ videos })
  } catch (error) {
    return response.status(500).json({ message: error.message || "Unable to load YouTube videos." })
  }
})

app.listen(port, () => {
  console.log(`NightTube backend listening on port ${port}`)
})
