"use client"

import { useSession } from "next-auth/react"
import { useCallback, useState } from "react"

export function useTravelData() {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Centralized Search Function
  const searchLocation = useCallback(async (locationData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/travel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...locationData,
          userId: session?.user?.id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch travel data")
      }
      
      
      setData(result.data)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  // Auto Detect Logic
  const autoDetect = useCallback(() => {
    const detectViaIP = async () => {
      try {
        const res = await fetch("/api/geolocation")
        const geoData = await res.json()
        if (geoData.location) {
          // Immediately trigger search with the resolved location
          searchLocation({ ...geoData.location, source: "ip" })
        }
      } catch (err) {
        console.error("IP Fallback failed", err)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // Reverse Geocode to get City/Country strings needed for DB lookup
            const res = await fetch(`/api/geolocation?lat=${latitude}&lon=${longitude}`)
            const geoData = await res.json()
            
            // Pass EVERYTHING to the search API
            searchLocation({ 
                ...geoData.location, // Contains city, country, lat, lon
                source: "gps" 
            })
          } catch (err) {
            detectViaIP()
          }
        },
        (err) => detectViaIP(),
        { timeout: 10000, enableHighAccuracy: true }
      )
    } else {
      detectViaIP()
    }
  }, [searchLocation])

  return { data, loading, error, searchLocation, autoDetect }
}