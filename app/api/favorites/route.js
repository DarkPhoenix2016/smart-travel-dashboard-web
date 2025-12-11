import connectDB from "@/lib/db"
import Record from "@/models/TravelRecord"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Sort by newest first
    const rawFavorites = user.favoriteLocations.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))

    // ENRICHMENT: Fetch the latest known Risk Level for these cities from your History/Records
    const enrichedFavorites = await Promise.all(rawFavorites.map(async (fav) => {
        // Find the most recent record for this city
        const lastRecord = await Record.findOne({
            "location.city": fav.city,
            "location.country": fav.country
        })
        .select("travelAdvisory.level") // Only get the level field
        .sort({ createdAt: -1 }) // Newest first

        return {
            ...fav.toObject(),
            _id: fav._id.toString(),
            // Extract "Level 1", "Level 2" etc, or default to Unknown
            currentRisk: lastRecord?.travelAdvisory?.level || "Unknown"
        }
    }))

    return NextResponse.json({ favorites: enrichedFavorites })
  } catch (error) {
    console.error("Fetch favorites error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { city, country, latitude, longitude } = await request.json()
    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    
    // Check duplicates
    const exists = user.favoriteLocations.some(f => f.city === city && f.country === country)
    if (exists) return NextResponse.json({ message: "Already in favorites" })

    // Add to start of array
    user.favoriteLocations.unshift({
        city, country, latitude, longitude, addedAt: new Date()
    })
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { city, country } = await request.json()
    await connectDB()

    await User.updateOne(
        { email: session.user.email },
        { $pull: { favoriteLocations: { city, country } } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}