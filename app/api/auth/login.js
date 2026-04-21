import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const users = []

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const user = users.find(u => u.email === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "token123",
      { expiresIn: "7d" }
    )

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to login." })
  }
}
