import { promises as fs } from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"

import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8")
  }
}

async function readUsers() {
  await ensureStore()
  const raw = await fs.readFile(USERS_FILE, "utf8")
  return JSON.parse(raw)
}

async function writeUsers(users) {
  await ensureStore()
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8")
}

async function withStorage(operation) {
  try {
    await connectToDatabase()
    return await operation("mongo")
  } catch {
    return operation("file")
  }
}

function normalizeMongoUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    image: user.image || "",
    provider: user.provider || "credentials",
    savedVideos: user.savedVideos || [],
  }
}

export async function findUserByEmail(email) {
  return withStorage(async (storage) => {
    if (storage === "mongo") {
      const user = await User.findOne({ email })
      return normalizeMongoUser(user)
    }

    const users = await readUsers()
    return users.find((user) => user.email === email) || null
  })
}

export async function createUser(userData) {
  return withStorage(async (storage) => {
    if (storage === "mongo") {
      const user = await User.create(userData)
      return normalizeMongoUser(user)
    }

    const users = await readUsers()
    const newUser = {
      id: randomUUID(),
      image: "",
      provider: "credentials",
      savedVideos: [],
      ...userData,
    }
    users.push(newUser)
    await writeUsers(users)
    return newUser
  })
}

export async function updateUser(userData) {
  return withStorage(async (storage) => {
    if (storage === "mongo") {
      const user = await User.findOneAndUpdate(
        { email: userData.email },
        { $set: userData },
        { new: true },
      )
      return normalizeMongoUser(user)
    }

    const users = await readUsers()
    const nextUsers = users.map((user) =>
      user.email === userData.email ? { ...user, ...userData } : user,
    )
    await writeUsers(nextUsers)
    return nextUsers.find((user) => user.email === userData.email) || null
  })
}

export async function upsertSavedVideos(email, savedVideos) {
  return withStorage(async (storage) => {
    if (storage === "mongo") {
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { savedVideos } },
        { new: true },
      )
      return normalizeMongoUser(user)
    }

    const users = await readUsers()
    const nextUsers = users.map((user) =>
      user.email === email ? { ...user, savedVideos } : user,
    )
    await writeUsers(nextUsers)
    return nextUsers.find((user) => user.email === email) || null
  })
}
