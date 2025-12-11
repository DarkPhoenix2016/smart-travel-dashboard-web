"use client"

import { Home, Star, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Helper to highlight active link
  const getLinkClass = (path) => 
    `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
      pathname === path 
        ? "text-primary font-bold" 
        : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-md md:hidden">
      <nav className="flex items-center justify-around h-16">
        <button onClick={() => router.push("/profile")} className={getLinkClass("/profile")}>
          <User size={20} /> Profile
        </button>
        <button onClick={() => router.push("/")} className={getLinkClass("/settings")}>
          <Home size={20} /> Home
        </button>
        <button onClick={() => router.push("/favorites")} className={getLinkClass("/favorites")}>
          <Star size={20} /> Favorite
        </button>
      </nav>
    </footer>
  )
}