"use client"

import { Loader2 } from "lucide-react"
import { createContext, useContext, useState } from "react"

const LoaderContext = createContext()

export function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("Loading...")

  const showLoader = (msg = "Loading...") => {
    setMessage(msg)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
    setMessage("")
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      
      {/* GLOBAL LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-background border border-border p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Please Wait</h3>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
            </div>
        </div>
      )}
    </LoaderContext.Provider>
  )
}

// Custom hook to use it easily in any component
export const useLoader = () => useContext(LoaderContext)