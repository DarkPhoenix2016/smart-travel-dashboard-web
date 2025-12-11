"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Mail, Shield, User } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session } = useSession()

  if (!session) return null // Middleware handles redirect, but this is a failsafe

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        
        {/* Main Info Card */}
        <Card className="p-6 md:p-8 border-border/50">
          <div className="flex flex-col items-center md:flex-row gap-6">
            <Avatar className="h-24 w-24 border-4 border-muted">
              <AvatarImage src={session.user?.image} alt={session.user?.name} />
              <AvatarFallback className="text-2xl">{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">{session.user?.name}</h2>
              <p className="text-muted-foreground">{session.user?.email}</p>
              <div className="pt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Account
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{session.user?.name}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{session.user?.email}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auth Provider</p>
              <p className="font-medium">Google OAuth</p>
            </div>
          </Card>
        </div>

        <Button 
          variant="destructive" 
          className="w-full md:w-auto gap-2 mt-4"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}