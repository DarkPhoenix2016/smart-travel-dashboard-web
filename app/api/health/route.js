import { NextResponse } from "next/server"
import connectDB from "@/lib/db"

export async function GET() {
  try {
    await connectDB()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date(),
      apis: {
        weather: "operational",
        airQuality: "operational",
        geolocation: "operational",
        advisory: "operational",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
