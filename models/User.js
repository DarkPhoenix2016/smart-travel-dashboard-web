import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: String,
    favoriteLocations: [
      {
        city: String,
        country: String,
        latitude: Number,
        longitude: Number,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastSearchedLocation: {
      city: String,
      country: String,
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
    preferences: {
      unit: {
        type: String,
        enum: ["metric", "imperial"],
        default: "metric",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model("User", userSchema)
