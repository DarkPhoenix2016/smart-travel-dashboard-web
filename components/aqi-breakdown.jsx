"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gauge, TrendingUp } from "lucide-react"
import { useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

export default function AQIBreakdown({ aqi, components, forecast }) {
  const [activeTab, setActiveTab] = useState("current")

  // --- Gauge Configuration ---
  const gaugeData = [
    { name: "Good", value: 1, color: "#22c55e" },      
    { name: "Fair", value: 1, color: "#84cc16" },      
    { name: "Moderate", value: 1, color: "#eab308" },  
    { name: "Poor", value: 1, color: "#f97316" },      
    { name: "Very Poor", value: 1, color: "#ef4444" }, 
  ]

  // Needle angle calculation for 180 degree gauge (1-5 scale)
  const needleAngle = 180 - ((aqi - 1) / 4) * 180

  const Needle = ({ cx, cy, iR, oR, color }) => {
    const RADIAN = Math.PI / 180
    // Make needle longer for the larger chart
    const length = (iR + 2 * oR) / 3
    const sin = Math.sin(-RADIAN * needleAngle)
    const cos = Math.cos(-RADIAN * needleAngle)
    const x0 = cx + 5 * cos 
    const y0 = cy + 5 * sin
    const x1 = cx - 5 * cos
    const y1 = cy - 5 * sin
    const xba = cx + length * cos
    const yba = cy + length * sin 

    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={color} />
        <path d={`M${x0},${y0}L${xba},${yba}L${x1},${y1}Z`} fill={color} />
      </g>
    )
  }

  // --- Custom Label for Gauge Segments (1, 2, 3...) ---
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180
    // Position text in the middle of the slice
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        className="text-lg font-bold drop-shadow-md"
      >
        {index + 1}
      </text>
    )
  }

  // --- Forecast Data Preparation ---
  const chartData = forecast ? forecast.map(item => ({
    time: new Date(item.date).toLocaleDateString("en-US", { weekday: 'short', hour: 'numeric' }),
    aqi: item.aqi,
    components: item.components
  })) : []

  // --- Custom Tooltip ---
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const comps = data.components || {};
      const color = gaugeData[(data.aqi || 1) - 1].color;

      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-xs backdrop-blur-md bg-opacity-95">
          <p className="font-bold mb-2 text-foreground">{label}</p>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
             <span className="font-semibold">AQI Level: {data.aqi}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground border-t border-border pt-2">
            <span>PM2.5: {Math.round(comps.pm2_5)}</span>
            <span>PM10: {Math.round(comps.pm10)}</span>
            <span>NO₂: {Math.round(comps.no2)}</span>
            <span>O₃: {Math.round(comps.o3)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-border/50 backdrop-blur-sm space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Air Quality</h3>
        <div className="flex bg-background/50 p-1 rounded-lg border border-border/50">
          <Button
            variant={activeTab === "current" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("current")}
            className="gap-2 text-xs"
          >
            <Gauge size={14} /> Current
          </Button>
          <Button
            variant={activeTab === "forecast" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("forecast")}
            className="gap-2 text-xs"
          >
            <TrendingUp size={14} /> Trend
          </Button>
        </div>
      </div>

      {activeTab === "current" ? (
        // --- TAB 1: AQI METER (Larger & Numbered) ---
        <div className="flex flex-col items-center">
          {/* Increased Height for Larger Meter */}
          <div className="relative h-[220px] w-full flex justify-center -mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={gaugeData}
                  cx="50%"
                  cy="75%" 
                  innerRadius={110} // Larger Radius
                  outerRadius={150} // Larger Radius
                  stroke="none"
                  label={renderCustomLabel} // Adds the numbers 1-5
                  labelLine={false}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Needle cx="50%" cy="75%" iR={110} oR={150} color="#cbd5e1" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Value Text */}
            <div className="absolute top-[45%] flex flex-col items-center transform translate-y-4">
               <span className="text-4xl font-extrabold text-foreground">{aqi}</span>
               <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">
                 {gaugeData[aqi - 1]?.name || "Unknown"}
               </span>
            </div>
          </div>
          
          <div className="h-6"></div>

          {/* Component Grid */}
          {components && (
            <div className="w-full mt-4 grid grid-cols-3 gap-2">
              {[
                { name: "PM2.5", val: components.pm2_5 },
                { name: "PM10", val: components.pm10 },
                { name: "NO₂", val: components.no2 },
                { name: "SO₂", val: components.so2 },
                { name: "O₃", val: components.o3 },
                { name: "CO", val: components.co },
              ].map((item, i) => (
                <div key={i} className="bg-secondary/10 p-2 rounded text-center border border-border/50">
                   <p className="text-[10px] text-muted-foreground">{item.name}</p>
                   <p className="font-bold text-sm">{Math.round(item.val)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // --- TAB 2: FORECAST TREND CHART ---
        <div className="h-[280px] w-full">
           {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                 <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)" 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0} 
                 />
                 <YAxis 
                    stroke="var(--color-muted-foreground)" 
                    tick={{ fontSize: 10 }} 
                    domain={[1, 5]} 
                    tickCount={5}
                    axisLine={false}
                    tickLine={false}
                 />
                 <Tooltip content={<CustomForecastTooltip />} />
                 <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#colorAqi)" 
                    strokeWidth={2}
                 />
               </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
               No forecast data available
             </div>
           )}
        </div>
      )}
    </Card>
  )
}