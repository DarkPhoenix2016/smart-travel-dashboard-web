"use client"

import { Card } from "@/components/ui/card"
import { Droplets, Wind } from "lucide-react"

export default function ForecastSlider({ forecastData, timezone }) {
  
  // Helper: Calculate local time at destination
  const getLocalTime = (dateInput) => {
    if (!dateInput) return new Date()
    
    // FIX: Ensure we have a Date object (handles JSON string dates)
    const dateObj = new Date(dateInput) 

    // 1. Get the underlying UTC timestamp (ms)
    const utcMs = dateObj.getTime() 
    
    // 2. Calculate the target time by adding the destination offset (in ms)
    // We treat the resulting "UTC" time as the "Wall Clock" time of the destination
    const targetMs = utcMs + ((timezone || 0) * 1000)
    
    return new Date(targetMs)
  }

  // Helper: Format Date
  const formatDate = (dateInput) => {
    // Get the shifted date object
    const shiftedDate = getLocalTime(dateInput)

    // CRITICAL: We use getUTC... methods here because we manually shifted 
    // the time in getLocalTime to match the destination's "Wall Clock" time 
    // stored in the UTC slot. This prevents the browser's local timezone from interfering.
    
    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
    const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: true, timeZone: "UTC" })

    return {
      day: dayFormatter.format(shiftedDate),
      time: timeFormatter.format(shiftedDate),
    }
  }

  // Helper: Icon Mapper
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
    }

    const iconName = Object.keys(iconMap).find(key => desc.includes(key))
      ? iconMap[Object.keys(iconMap).find(key => desc.includes(key))]
      : "sun.svg"

    return `/icons/${iconName}`
  }

  return (
    <div className="w-full space-y-2">
      <h3 className="text-lg font-semibold text-foreground px-1">Forecast Next 5 Days</h3>
      
      {/* Slider Container */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-1 px-1">
        {forecastData.map((item, index) => {
          const { day, time } = formatDate(item.date)
          
          return (
            <Card 
              key={index} 
              className="min-w-[140px] shrink-0 p-4 flex flex-col items-center justify-between gap-3 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors border-border/50"
            >
              {/* Date & Time */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium">{day}</p>
                <p className="text-sm font-bold text-foreground">{time}</p>
              </div>

              {/* Icon */}
              <div className="relative w-12 h-12">
                 <img 
                    src={getWeatherIcon(item.description)} 
                    alt={item.description}
                    className="w-full h-full object-contain drop-shadow-sm"
                 />
              </div>

              {/* Temperature */}
              <div className="text-center">
                <span className="text-xl font-bold">{item.temperature}°</span>
                <p className="text-[10px] text-muted-foreground capitalize truncate max-w-[100px]">
                  {item.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 w-full justify-center border-t border-border/50 pt-3 mt-1">
                <div className="flex flex-col items-center gap-0.5">
                  <Droplets size={12} className="text-blue-400" />
                  <span className="text-[10px] font-medium">{item.humidity}%</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Wind size={12} className="text-slate-400" />
                  <span className="text-[10px] font-medium">{item.windSpeed}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}