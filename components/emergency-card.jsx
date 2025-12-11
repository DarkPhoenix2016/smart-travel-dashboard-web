"use client"

import { Card } from "@/components/ui/card"
import {
    Flame,
    Info,
    MapPin,
    Phone,
    ShieldAlert,
    Siren
} from "lucide-react"

export default function EmergencyCard({ emergencyData, countryName }) {
  if (!emergencyData) return null

  // Helper to render clickable phone numbers
  const renderNumbers = (numbers, colorClass) => {
    if (!numbers || numbers.length === 0) {
      return <span className="text-xl font-bold text-muted-foreground">--</span>
    }

    return (
      <div className="flex flex-col items-end gap-1">
        {numbers.map((num, idx) => (
          <a 
            key={idx} 
            href={`tel:${num}`}
            className={`text-2xl font-black ${colorClass} hover:underline hover:opacity-80 transition-all active:scale-95`}
            title={`Call ${num}`}
          >
            {num}
          </a>
        ))}
      </div>
    )
  }

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full shadow-sm">
          <Siren size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Emergency Assistance</h3>
          <p className="text-sm text-muted-foreground">
            Tap any number to dial immediately in {countryName}.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Police */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 shadow-sm transition-colors hover:bg-red-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 dark:bg-black/20 rounded-full text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Police</p>
              <p className="text-[10px] text-red-600/70">Law Enforcement</p>
            </div>
          </div>
          {renderNumbers(emergencyData.police, "text-red-700")}
        </div>

        {/* Ambulance */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 shadow-sm transition-colors hover:bg-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 dark:bg-black/20 rounded-full text-blue-600">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Medical</p>
              <p className="text-[10px] text-blue-600/70">Ambulance</p>
            </div>
          </div>
          {renderNumbers(emergencyData.ambulance, "text-blue-700")}
        </div>

        {/* Fire */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 shadow-sm transition-colors hover:bg-orange-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 dark:bg-black/20 rounded-full text-orange-600">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Fire</p>
              <p className="text-[10px] text-orange-600/70">Fire Dept</p>
            </div>
          </div>
          {renderNumbers(emergencyData.fire, "text-orange-700")}
        </div>

        {/* General Dispatch */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 shadow-sm transition-colors hover:bg-green-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 dark:bg-black/20 rounded-full text-green-600">
              <Info size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">General</p>
              <p className="text-[10px] text-green-600/70">Dispatch / SOS</p>
            </div>
          </div>
          {renderNumbers(emergencyData.dispatch, "text-green-700")}
        </div>

      </div>

      {/* Footer Info */}
      <div className="space-y-3">
        {emergencyData.member_112 && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-700">
            <Info size={16} />
            <p className="text-xs font-medium">
              This country is a member of the <strong>European 112</strong> emergency system.
            </p>
          </div>
        )}

        <div className="p-4 bg-secondary/10 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin size={16} /> Consular Assistance
          </h4>
          <p className="text-xs text-muted-foreground">
            For lost passports or legal trouble, contact your local embassy. 
            Ensure you have digital copies of your documents available offline.
          </p>
        </div>
      </div>

    </Card>
  )
}