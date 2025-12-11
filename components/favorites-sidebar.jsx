"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, MapPin, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function FavoritesSidebar({ onSelectFavorite }) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // Function to load favorites
  const fetchFavorites = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch("/api/favorites")
      if (res.ok) {
        const data = await res.json()
        // Take top 10
        setFavorites(data.favorites.slice(0, 10))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [session]) // Reload when session changes

  if (!session) return null // Don't show if not logged in

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Star className="text-yellow-500 fill-yellow-500" size={18} /> 
          Favorites
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={fetchFavorites}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : favorites.length === 0 ? (
          <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
            No favorites yet.
          </div>
        ) : (
          favorites.map((fav, i) => (
            <Card 
              key={i}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-border/50 group"
              onClick={() => onSelectFavorite({ 
                  city: fav.city, 
                  country: fav.country, 
                  latitude: fav.latitude, 
                  longitude: fav.longitude 
              })}
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{fav.city}</p>
                  <p className="text-xs text-muted-foreground">{fav.country}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}