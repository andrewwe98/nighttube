import jwt from "jsonwebtoken"

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." })
    }

    jwt.verify(token, process.env.JWT_SECRET || "token123")

    const queryParam = req.query.q?.toString() || ""
    
    // Mock YouTube data for now
    const mockVideos = [
      {
        videoId: "dQw4w9WgXcQ",
        title: "Never Gonna Give You Up",
        channel: "Rick Astley",
        description: "The official video for 'Never Gonna Give You Up' by Rick Astley.",
        published: "Jul 25, 2009",
        duration: "3:33",
        views: 1400000000,
        category: "Music",
      },
      {
        videoId: "jNQXAC9IVRw",
        title: "Me at the zoo",
        channel: "jawed",
        description: "The first video on YouTube.",
        published: "Apr 23, 2005",
        duration: "0:19",
        views: 280000000,
        category: "Entertainment",
      },
    ]

    return res.json({ videos: mockVideos })
  } catch {
    return res.status(401).json({ message: "Unauthorized." })
  }
}
