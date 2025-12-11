"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function WeatherCard({ data }) {
  const [timeOfDay, setTimeOfDay] = useState("afternoon")
  const [localTime, setLocalTime] = useState(null)

  // We expect data.timezone to be the offset in seconds from UTC (e.g., 19800 for IST)
  // If your API puts it inside weather, change to data.weather.timezone
  const timezoneOffset = data.timezone || data.weather?.timezone || 0 

  useEffect(() => {
    const calculateLocalTime = () => {
      // 1. Get current UTC time in milliseconds
      const now = new Date()
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000)

      // 2. Add the target location's offset (convert seconds to ms)
      const targetTimeMs = utcMs + (timezoneOffset * 1000)
      const targetDate = new Date(targetTimeMs)

      setLocalTime(targetDate)

      // 3. Determine Time of Day based on TARGET hour
      const hour = targetDate.getHours()
      let phase = "afternoon"

      if (hour >= 5 && hour < 12) phase = "morning"
      else if (hour >= 12 && hour < 17) phase = "afternoon"
      else if (hour >= 17 && hour < 20) phase = "evening"
      else phase = "night"

      setTimeOfDay(phase)
    }

    // Run immediately
    calculateLocalTime()

    // Update every minute
    const timer = setInterval(calculateLocalTime, 60000)

    return () => clearInterval(timer)
  }, [timezoneOffset])

  // Map API Weather descriptions to your local icons
  const getWeatherIcon = (description) => {
    if (!description) return "/icons/sun.svg"
    const desc = description.toLowerCase()
    
    const iconMap = {
      "clear": "sun.svg",
      "sunny": "sun.svg",
      "partly cloudy": "partly-cloudy.svg",
      "clouds": "cloudy.svg",
      "overcast": "overcast.svg",
      "rain": "rain.svg",
      "drizzle": "drizzle.svg",
      "shower": "heavy-rain.svg",
      "thunderstorm": "thunder.svg",
      "storm": "storm.svg",
      "snow": "snow.svg",
      "mist": "mist.svg",
      "fog": "fog.svg",
      "haze": "haze.svg",
      "wind": "windy.svg",
      "night": "moon.svg",
    }

    const iconName = Object.keys(iconMap).find(key => desc.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => desc.includes(key))] 
      : "sun.svg"

    // If it's night time and the weather is clear/sunny, use the moon
    if (timeOfDay === "night" && (desc.includes("clear") || desc.includes("sunny"))) {
        return "/icons/moon.svg"
    }

    return `/icons/${iconName}`
  }

  // Format Date for display
  const formattedDate = localTime ? localTime.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }) : "Loading..."

  // Background Image Path
  const bgImage = `/art/${timeOfDay}.svg`

  return (
    <Card className="relative overflow-hidden w-full h-100 border-0 shadow-lg text-white group">
      
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content Container */}
      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        
        {/* Top: Location & Date */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              {data.location.city}
            </h2>
            <p className="text-sm font-medium text-white/90 drop-shadow-sm">
              {data.location.country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold drop-shadow-md">
              {localTime 
                ? localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : "--:--"}
            </p>
            <p className="text-xs text-white/80 font-medium">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Bottom: Weather Info */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              {/* Weather Icon */}
              <img 
                src={getWeatherIcon(data.weather.description)} 
                alt={data.weather.description}
                className="w-16 h-16 object-contain drop-shadow-lg filter brightness-110"
              />
              <span className="text-6xl font-bold drop-shadow-lg">
                {Math.round(data.weather.temperature)}°
              </span>
            </div>
            <p className="text-lg font-medium capitalize mt-1 pl-2 drop-shadow-md">
              {data.weather.description}
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex gap-4 text-xs font-medium text-white/90">
            <div className="flex flex-col items-end">
              <span>Humidity</span>
              <span className="text-sm font-bold">{data.weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span>Wind</span>
              <span className="text-sm font-bold">{data.weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}