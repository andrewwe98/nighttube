import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const users = []

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." })
    }

    const existingUser = users.find(user => user.email === email.toLowerCase())
    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    }
    
    users.push(user)

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "token123",
      { expiresIn: "7d" }
    )

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create account." })
  }
}
