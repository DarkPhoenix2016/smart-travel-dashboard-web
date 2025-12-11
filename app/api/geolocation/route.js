import { getLocationFromCoordinates, getLocationFromIP } from '@/lib/services/geolocation-service'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  // PRIORITY 1: Check for GPS Coordinates FIRST
  // If we have coordinates, use them and return immediately.
  // Do NOT run the heavy IP detection logic.
  if (lat && lon) {
    try {
      const location = await getLocationFromCoordinates(lat, lon)
      return NextResponse.json({ 
        location: {
            ...location,
            source: 'gps' // Mark as GPS so we know
        } 
      })
    } catch (error) {
      console.error("GPS Reverse Geocoding failed:", error)
      return NextResponse.json({ error: "Failed to resolve coordinates" }, { status: 500 })
    }
  }

  // PRIORITY 2: Fallback to IP Detection
  // Only runs if lat/lon are missing
  try {
    // Get client IP
    let ip = request.headers.get("x-forwarded-for") || "127.0.0.1"
    if (ip.includes(",")) ip = ip.split(",")[0] // Handle multiple IPs

    const location = await getLocationFromIP(ip)

    return NextResponse.json({ 
        location: {
            ...location,
            source: 'ip'
        } 
    })
  } catch (error) {
    console.error("IP Geolocation failed:", error)
    return NextResponse.json({ error: "Failed to detect location" }, { status: 500 })
  }
}