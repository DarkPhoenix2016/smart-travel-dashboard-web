"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, LogIn, LogOut, Star, User } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SiteHeader() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <header className="fixed min-w-dvw top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo / Title Area */}
          <Link href="/" className="cursor-pointer">
            <div className="flex flex-col">
              {/* Desktop Title */}
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">Smart Travel & Safety Dashboard</h1>
              </div>
              {/* Mobile Title */}
              <div className="md:hidden">
                <h1 className="text-lg font-bold text-foreground">STS Dashboard</h1>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation (Right) */}
          <div className="hidden md:flex items-center gap-4">
            {!session ? (
              <Button onClick={() => signIn("google")} className="gap-2">
                <LogIn size={18} />
                Sign In
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border p-0 overflow-hidden">
                      <img 
                        src={session.user?.image || "/avatar-placeholder.png"} 
                        alt="User" 
                        className="h-full w-full object-cover"
                      />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push("/favorites")}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}