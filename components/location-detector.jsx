"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLoader } from "@/context/loader-context"; // Import the hook
import { MapPin } from "lucide-react";
import { useState } from "react";

export default function LocationDetector({ onLocationDetected }) {
  // We removed local 'loading' state!
  const { showLoader, hideLoader } = useLoader() // Use the global loader
  
  const [manualCity, setManualCity] = useState("")
  const [manualCountry, setManualCountry] = useState("")
  const [error, setError] = useState(null)

  const detectViaIP = async () => {
    showLoader("Detecting IP location...") // Trigger global loader
    setError(null)
    try {
      const response = await fetch("/api/geolocation")
      const data = await response.json()

      if (data.location) {
        onLocationDetected({
          ...data.location,
          source: "ip",
        })
      } else {
        throw new Error("No location data found")
      }
    } catch (err) {
      setError("Failed to detect location via IP")
      console.error(err)
    } finally {
      hideLoader() // Hide it when done
    }
  }

  const detectViaGPS = () => {
    showLoader("Requesting GPS access...") // Trigger global loader
    setError(null)

    if (!navigator.geolocation) {
      setError("GPS not available in your browser")
      hideLoader()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Update message while 
          showLoader("Fetching city details...")
          
          const response = await fetch(`/api/geolocation?lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          
          const city = data.location?.city || "Current Location"
          const country = data.location?.country || "Unknown"

          onLocationDetected({
            latitude,
            longitude,
            city,
            country,
            source: "gps",
          })
        } catch (err) {
           console.error(err)
           onLocationDetected({
              latitude,
              longitude,
              city: "GPS Location",
              country: "Unknown",
              source: "gps"
           })
        } finally {
          hideLoader()
        }
      },
      (err) => {
        console.warn("GPS Error:", err)
        setError("Failed to get GPS location. Try using IP detection.")
        hideLoader()
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }


  return (
    <Card className="p-6 space-y-0 border-border/50 backdrop-blur-sm relative">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" /> 
        Detect Your Location
      </h2>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {/* Buttons don't need 'disabled' prop anymore if the overlay blocks clicks, 
            but keeping it is good practice */}
        <Button onClick={detectViaGPS} variant="default" className="w-full">
          Use GPS
        </Button>
        <Button onClick={detectViaIP} variant="outline" className="w-full bg-transparent">
          Use Current IP
        </Button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
          {error}
        </div>
      )}
    </Card>
  )
}