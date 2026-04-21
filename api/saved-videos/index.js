import jwt from "jsonwebtoken"

const savedVideos = new Map()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization || ""
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

      if (!token) {
        return res.status(401).json({ message: "Unauthorized." })
      }

      const user = jwt.verify(token, process.env.JWT_SECRET || "token123")
      const userVideos = savedVideos.get(user.email) || []
      return res.json({ savedVideos: userVideos })
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized." })
    }
  } else if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization || ""
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

      if (!token) {
        return res.status(401).json({ message: "Unauthorized." })
      }

      const user = jwt.verify(token, process.env.JWT_SECRET || "token123")
      const newSavedVideos = Array.isArray(req.body.savedVideos) ? req.body.savedVideos : []
      savedVideos.set(user.email, newSavedVideos)
      return res.json({ savedVideos: newSavedVideos })
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized." })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
