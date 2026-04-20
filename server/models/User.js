import mongoose from "mongoose"

const SavedVideoSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    channel: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { _id: false },
)

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedVideos: {
      type: [SavedVideoSchema],
      default: [],
    },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model("User", UserSchema)
