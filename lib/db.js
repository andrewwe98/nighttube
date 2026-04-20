import mongoose from "mongoose"

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/nighttube"

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI || DEFAULT_MONGODB_URI)
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (!isDatabaseConfigured()) {
    return null
  }

  const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .catch(() => {
        cached.promise = null

        throw new Error(
          `Could not connect to MongoDB at ${MONGODB_URI}. Start a MongoDB server or update MONGODB_URI in .env.local.`,
        )
      })
  }

  cached.conn = await cached.promise

  return cached.conn
}
