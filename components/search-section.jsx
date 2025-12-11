"use client"

import LocationDetector from "@/components/location-detector"
import ManualSearch from "@/components/manual-search"

export default function SearchSection({ onSearch }) {
  return (
    <div className="space-y-4 p-4 border border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-foreground">Plan Your Trip</h2>
      <ManualSearch onSearch={onSearch} />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or detect automatically</span>
        </div>
      </div>

      <LocationDetector onLocationDetected={onSearch} />
    </div>
  )
}