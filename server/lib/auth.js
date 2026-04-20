import jwt from "jsonwebtoken"

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function requireAuth(request, response, next) {
  const header = request.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return response.status(401).json({ message: "Unauthorized." })
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return response.status(401).json({ message: "Unauthorized." })
  }
}
