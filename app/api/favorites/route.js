import { authOptions } from "@/lib/auth"; // <--- CORRECT IMPORT
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return favorites sorted by newest first
    // Note: ensure your User schema has 'favoriteLocations'
    const favorites = user.favoriteLocations
      ? user.favoriteLocations.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      : [];

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Favorites GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { city, country, latitude, longitude } = await request.json();
    
    // Basic validation
    if (!city || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check duplicates
    const exists = user.favoriteLocations.some(
      (f) => f.city === city && f.country === country
    );

    if (exists) {
      return NextResponse.json({ message: "Already in favorites" }, { status: 409 });
    }

    // Add to array
    user.favoriteLocations.unshift({
      city,
      country,
      latitude,
      longitude,
      addedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ success: true, favorites: user.favoriteLocations });
  } catch (error) {
    console.error("Favorites POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { city, country } = await request.json(); // Or use query params/ID
    await connectDB();

    await User.updateOne(
      { email: session.user.email },
      { $pull: { favoriteLocations: { city, country } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorites DELETE Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}