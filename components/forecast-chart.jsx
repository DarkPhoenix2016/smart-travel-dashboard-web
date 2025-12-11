"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CloudRain, Thermometer, Wind } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default function ForecastChart({ forecastData }) {
  const [activeTab, setActiveTab] = useState("temperature")

  // --- DATA PROCESSING: Aggregate 3-hour chunks into Daily Averages ---
  const dailyData = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return []

    const daysMap = {}

    forecastData.forEach((item) => {
      // Create a key for the day (e.g., "Mon 10")
      // Use the timezone from the item if available, otherwise browser local
      const dateObj = new Date(item.date)
      const dayKey = dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })

      if (!daysMap[dayKey]) {
        daysMap[dayKey] = {
          name: dayKey,
          tempSum: 0,
          humiditySum: 0,
          windSum: 0,
          count: 0,
        }
      }

      daysMap[dayKey].tempSum += item.temperature
      daysMap[dayKey].humiditySum += item.humidity
      daysMap[dayKey].windSum += item.windSpeed
      daysMap[dayKey].count += 1
    })

    // Calculate averages and return first 5 days
    return Object.values(daysMap)
      .map((day) => ({
        name: day.name,
        temperature: Math.round(day.tempSum / day.count),
        humidity: Math.round(day.humiditySum / day.count),
        windSpeed: Math.round((day.windSum / day.count) * 10) / 10, // Round to 1 decimal
      }))
      .slice(0, 5)
  }, [forecastData])

  // --- CUSTOM TAB BUTTON ---
  const TabButton = ({ id, label, icon: Icon }) => (
    <Button
      variant={activeTab === id ? "secondary" : "ghost"}
      size="sm"
      onClick={() => setActiveTab(id)}
      className={`flex-1 gap-2 text-xs md:text-sm ${
        activeTab === id ? "bg-muted font-bold text-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Button>
  )

  return (
    <Card className="p-4 md:p-6 border-border/50 backdrop-blur-sm space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground self-start sm:self-center">
          5-Day Trend
        </h3>
        <div className="flex w-full sm:w-auto bg-background/50 p-1 rounded-lg border border-border/50">
          <TabButton id="temperature" label="Temp" icon={Thermometer} />
          <TabButton id="humidity" label="Humidity" icon={CloudRain} />
          <TabButton id="wind" label="Wind" icon={Wind} />
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "temperature" ? (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}°C`, "Avg Temp"]}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#eab308"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTemp)"
              />
            </AreaChart>
          ) : activeTab === "humidity" ? (
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, "Avg Humidity"]}
              />
              <Bar 
                dataKey="humidity" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          ) : (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} km/h`, "Avg Wind"]}
              />
              <Area
                type="monotone"
                dataKey="windSpeed"
                stroke="#64748b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWind)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  )
}