// app/api/travel/all/route.js
import { getAllAdvisories } from "@/lib/services/advisory/travel-advisory-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getAllAdvisories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch advisories" }, { status: 500 });
  }
}