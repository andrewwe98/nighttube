// In-memory database mock for testing
const users = []
const savedVideos = new Map()

export async function connectToDatabase() {
  // Mock database connection - always succeeds
  return Promise.resolve()
}

export { users, savedVideos }
