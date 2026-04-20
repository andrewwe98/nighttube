import mongoose from "mongoose"

let cached = global.mongooseServer

if (!cached) {
  cached = global.mongooseServer = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
