import { getEmergencyData } from "@/lib/services/emergency-service";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  if (!country) {
    return NextResponse.json({ error: "Country name is required" }, { status: 400 });
  }

  try {
    const data = await getEmergencyData(country);
    
    if (!data) {
      return NextResponse.json({ error: "Emergency data not found for this country" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Emergency API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}