import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import TravelRecord from "@/models/TravelRecord"

export async function GET(request) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const records = await TravelRecord.find({ userId }).sort({ searchedAt: -1 }).limit(50)

    return NextResponse.json({
      records,
      count: records.length,
    })
  } catch (error) {
    console.error("Fetch records error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch records",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recordId } = await request.json()

    await connectDB()

    const result = await TravelRecord.findByIdAndDelete(recordId)

    if (!result) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete record error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete record",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
