"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Loader2, MapPin, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      loadFavorites()
    }
  }, [status, router])

  const loadFavorites = async () => {
    try {
      const res = await fetch("/api/favorites")
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites)
      }
    } catch (error) {
      console.error("Failed to load favorites", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (city, country) => {
    if(!confirm(`Remove ${city} from favorites?`)) return;

    // Optimistic update
    setFavorites(prev => prev.filter(f => f.city !== city))

    try {
        await fetch("/api/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city, country })
        })
    } catch (error) {
        console.error("Delete failed")
        loadFavorites() // Revert on fail
    }
  }

  // --- Styles for Risk Level ---
  const getRiskBadge = (level) => {
    if (!level || level === "Unknown") return <span className="text-gray-500 text-xs">Unknown</span>
    
    // Parse "Level 1", "Level 2" etc
    const num = parseInt(level.match(/\d+/)?.[0] || "1")
    
    const colors = {
        1: "bg-green-100 text-green-700 border-green-200",
        2: "bg-yellow-100 text-yellow-700 border-yellow-200",
        3: "bg-orange-100 text-orange-700 border-orange-200",
        4: "bg-red-100 text-red-700 border-red-200"
    }
    const style = colors[num] || colors[1]

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${style}`}>
            {level}
        </span>
    )
  }

  // --- Pagination Logic ---
  const totalPages = Math.ceil(favorites.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = favorites.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Favorite Destinations</h1>
        <p className="text-muted-foreground">{favorites.length} Saved Locations</p>
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Current Risk</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {favorites.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No favorites added yet. Search for a city to add one!
                    </TableCell>
                </TableRow>
            ) : (
                currentData.map((fav, i) => (
                <TableRow key={i}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="text-base font-bold">{fav.city}</div>
                                <div className="text-xs text-muted-foreground">{fav.country}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        {getRiskBadge(fav.currentRisk)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {new Date(fav.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleRemove(fav.city, fav.country)}
                        >
                            <Trash2 size={18} />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={16} /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
            >
                Next <ChevronRight size={16} />
            </Button>
        </div>
      )}
    </div>
  )
}