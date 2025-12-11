"use client"

import {
  CloudRain,
  Coins,
  Database,
  Globe,
  Heart,
  LayoutDashboard,
  Loader,
  MapPin,
  ShieldAlert,
  Siren
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Custom Components
import CountryInfoCard from "@/components/country-info-card"
import CurrencyCard from "@/components/currency-card"
import EmergencyCard from "@/components/emergency-card"
import FavoritesSidebar from "@/components/favorites-sidebar"
import GlobalSafetyMap from "@/components/global-safety-map"
import SearchSection from "@/components/search-section"
import TravelInsightsCard from "@/components/travel-insights-card"
import WeatherCard from "@/components/weather-card"

// Data Widgets
import AQIBreakdown from "@/components/aqi-breakdown"
import ForecastChart from "@/components/forecast-chart"
import ForecastSlider from "@/components/forecast-slider"




// --- 2. RESPONSIVE WRAPPERS ---
const DesktopSidebar = ({ children }) => <div className="hidden lg:block lg:col-span-3 space-y-6 lg:sticky lg:top-28 lg:self-start h-fit overflow-y-auto max-h-[calc(100vh-8rem)]">{children}</div>
const MobileSearchArea = ({ children }) => <div className="lg:hidden mb-6">{children}</div>

// --- 3. MAIN PAGE COMPONENT ---
export default function Dashboard() {
  const { data: session, status } = useSession()
  
  const [travelData, setTravelData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  // Refs
  const hasInitialized = useRef(false)
  const searchSourceRef = useRef(null)

  // --- INITIALIZATION EFFECT ---
  useEffect(() => {
    if (status === "loading") return;
    
    // Prevent double execution in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (session) loadFavorites();
    autoDetectLocation();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // --- API FUNCTIONS ---
  const loadFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")
      if (response.ok) {
        const data = await response.json()
        const favoriteKeys = new Set(data.favorites.map((fav) => `${fav.city}-${fav.country}`))
        setFavorites(favoriteKeys)
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    }
  }

  const handleAddFavorite = async (location) => {
    if (!session) return 
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      })
      if (response.ok) {
        setFavorites(prev => new Set([...prev, `${location.city}-${location.country}`]))
      }
    } catch (error) {
      console.error("Failed to add favorite:", error)
    }
  }

  // --- SEARCH & DETECTION LOGIC ---
  const handleLocationDetected = async (location, sourceType = 'manual') => {
    // Locking Mechanism: Ignore 'ip' if we already have 'gps' or 'manual'
    const currentPriority = searchSourceRef.current;
    if (sourceType === 'ip' && (currentPriority === 'gps' || currentPriority === 'manual')) {
        return;
    }
    
    searchSourceRef.current = sourceType;
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/travel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...location,
            userId: session?.user?.id 
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch travel data")
      }

      setTravelData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fallbackToIP = async () => {
    if (searchSourceRef.current === 'gps') return;
    try {
      const response = await fetch("/api/geolocation")
      const data = await response.json()
      if (data.location) {
        handleLocationDetected({ ...data.location }, 'ip')
      }
    } catch (err) {
      console.error("IP Fallback failed", err)
    }
  }

  const autoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(`/api/geolocation?lat=${latitude}&lon=${longitude}`)
            const data = await response.json()
            handleLocationDetected({ ...data.location }, 'gps')
          } catch (err) {
            fallbackToIP()
          }
        },
        (err) => {
          fallbackToIP()
        },
        { timeout: 8000, enableHighAccuracy: false }
      )
    } else {
      fallbackToIP()
    }
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === LEFT SIDEBAR === */}
        <DesktopSidebar>
          <SearchSection onSearch={handleLocationDetected} />
        </DesktopSidebar>

        {/* === CENTER CONTENT === */}
        <div className="lg:col-span-6 min-h-[500px]">

          <GlobalSafetyMap selectedCountry={travelData?.location?.country} />

          <MobileSearchArea>
             <SearchSection onSearch={handleLocationDetected} />
          </MobileSearchArea>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader className="animate-spin text-primary" size={32} />
              <p className="text-muted-foreground">Analysing travel data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive mb-6">
              <p className="font-bold">Error Loading Data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !travelData && !error && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-xl p-10 bg-card/30">
                <MapPin className="w-10 h-10 mb-2 opacity-50" />
                <p>Search for a location or enable GPS to begin.</p>
            </div>
          )}

          {travelData && !loading && (
            <Tabs defaultValue="general" className="w-full mt-4 space-y-6">
              
              <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
                <TabsTrigger value="general" className="gap-2 py-2.5 text-xs md:text-sm">
                    <LayoutDashboard className="h-4 w-4" /> <span className="hidden md:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="warnings" className="gap-2 py-2.5 text-xs md:text-sm">
                    <ShieldAlert className="h-4 w-4" /> <span className="hidden md:inline">Warnings</span>
                </TabsTrigger>
                
                <TabsTrigger value="currency" className="gap-2 py-2.5 text-xs md:text-sm">
                    <Coins className="h-4 w-4" /> <span className="hidden md:inline">Currency</span>
                </TabsTrigger>
                <TabsTrigger value="forecasts" className="gap-2 py-2.5 text-xs md:text-sm">
                    <CloudRain className="h-4 w-4" /> <span className="hidden md:inline">Forecast</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="gap-2 py-2.5 text-xs md:text-sm">
                    <Siren className="h-4 w-4" /> <span className="hidden md:inline">Emergency</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 animate-in fade-in-50">
                {travelData && (
                    <>
                      <div className="p-6 pb-4 border-b border-border/50 flex items-start justify-between bg-card/50 rounded-xl">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                              <MapPin className="text-primary h-6 w-6" />
                              {travelData.location.country}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1 ml-8">
                              {travelData.location.city}
                            </p>
                            <div className="flex items-center gap-2 mt-2 ml-8">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                                    travelData.source === 'cache' 
                                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" 
                                    : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                }`}>
                                    {travelData.source === 'cache' ? <Database size={10} /> : <Globe size={10} />}
                                    {travelData.source === 'cache' ? "Cached" : "Live API"}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddFavorite(travelData.location)}
                            className={`rounded-full ${favorites.has(`${travelData.location.city}-${travelData.location.country}`) ? "text-red-500 bg-red-50 hover:bg-red-100" : "hover:bg-muted"}`}
                        >
                            <Heart className={favorites.has(`${travelData.location.city}-${travelData.location.country}`) ? "fill-current" : ""} size={22} />
                        </Button>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground px-1">Current Weather & Time</h3>
                      <WeatherCard data={travelData} />
                    </>
                )}
                {travelData.countryInfo && (
                    <>
                        <h3 className="text-lg font-semibold text-foreground px-1 mt-6">
                            About {travelData.location.country}
                        </h3>
                        <CountryInfoCard country={travelData.countryInfo} />
                    </>
                )}
              </TabsContent>

              <TabsContent value="warnings" className="animate-in fade-in-50">
                <TravelInsightsCard
                  data={travelData}
                  onAddFavorite={handleAddFavorite} // Logic handled inside card or passed here
                  isFavorite={favorites.has(`${travelData.location.city}-${travelData.location.country}`)}
                />
              </TabsContent>


              <TabsContent value="currency" className="animate-in fade-in-50">
                 <div className="space-y-6">
                    <CurrencyCard localCurrencyCode={travelData.countryInfo?.currencies?.[0]?.code} />
                 </div>
              </TabsContent>

              <TabsContent value="forecasts" className="space-y-6 animate-in fade-in-50">
                <ForecastSlider 
                    forecastData={travelData.forecast} 
                    timezone={travelData.timezone} 
                />
                <ForecastChart forecastData={travelData.forecast} />
                {travelData.airQuality && (
                    <AQIBreakdown 
                        aqi={travelData.airQuality.aqi}
                        components={travelData.airQuality.components}
                        forecast={travelData.airQualityForecast} 
                    />
                )}
              </TabsContent>

              <TabsContent value="emergency" className="animate-in fade-in-50">
                 <div className="space-y-6">
                    <EmergencyCard 
                        emergencyData={travelData.emergencyInfo} 
                        countryName={travelData.location.country} 
                    />
                 </div>
              </TabsContent>

            </Tabs>
          )}
        </div>

        {/* === RIGHT SIDEBAR === */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <FavoritesSidebar onSelectFavorite={(loc) => handleLocationDetected(loc, 'manual')} />
        </div>

      </div>
    </main>
  )
}