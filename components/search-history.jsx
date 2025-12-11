"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, MapPin, X } from "lucide-react"
import { useEffect, useState } from "react"

export default function SearchHistory({ onSelectRecord }) {
  const [history, setHistory] = useState([])

  // 1. Load History from Session Storage on Mount
  useEffect(() => {
    // sessionStorage persists while the tab is open, but clears when closed.
    // This perfectly matches "Current Session Only" behavior.
    const stored = sessionStorage.getItem("travel_search_history")
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse history", e)
      }
    }

    // Listen for custom event to update history when a new search happens
    const handleNewSearch = (event) => {
      if (event.detail) {
        addToHistory(event.detail)
      }
    }

    window.addEventListener("travel-search-added", handleNewSearch)
    return () => window.removeEventListener("travel-search-added", handleNewSearch)
  }, [])

  // 2. Helper to Add to History (and update Session Storage)
  const addToHistory = (record) => {
    setHistory((prev) => {
      // Avoid duplicates (move to top if exists)
      const filtered = prev.filter(
        (item) => 
          item.location.city !== record.location.city || 
          item.location.country !== record.location.country
      )
      
      const newHistory = [record, ...filtered].slice(0, 10) // Limit to 10 items
      
      // Save to Session Storage
      sessionStorage.setItem("travel_search_history", JSON.stringify(newHistory))
      return newHistory
    })
  }

  // 3. Clear Specific Item
  const removeItem = (e, index) => {
    e.stopPropagation() // Prevent triggering the card click
    const newHistory = history.filter((_, i) => i !== index)
    setHistory(newHistory)
    sessionStorage.setItem("travel_search_history", JSON.stringify(newHistory))
  }

  // 4. Clear All
  const clearAll = () => {
    setHistory([])
    sessionStorage.removeItem("travel_search_history")
  }

  if (history.length === 0) {
    return (
      <div className="p-4 border border-dashed border-border/50 rounded-xl text-center text-muted-foreground text-sm bg-card/30">
        <Clock className="mx-auto mb-2 opacity-50" size={20} />
        <p>No recent searches</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          Recent Searches
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-muted-foreground hover:text-destructive"
          onClick={clearAll}
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((record, index) => (
          <Card 
            key={`${record.location.city}-${index}`}
            className="group relative p-3 cursor-pointer hover:bg-accent/50 transition-all border-border/50 hover:border-primary/30"
            onClick={() => onSelectRecord(record)}
          >
            <div className="flex items-start gap-3">
              <div className="bg-secondary/20 p-2 rounded-full text-muted-foreground group-hover:text-primary transition-colors">
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">
                  {record.location.city}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate max-w-20">{record.location.country}</span>
                  <span>•</span>
                  <span>{new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              
              {/* Delete Button (Visible on Hover) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => removeItem(e, index)}
              >
                <X size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}