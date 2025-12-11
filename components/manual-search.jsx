"use client"

import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Loader2, MapPin, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function ManualSearch({ onSearch }) {
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCityData, setSelectedCityData] = useState(null)
  
  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  
  const [showCountryList, setShowCountryList] = useState(false)
  const [showCityList, setShowCityList] = useState(false)
  
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  const countryRef = useRef(null)
  const cityRef = useRef(null)

  // 1. Load Countries on Mount
  useEffect(() => {
    async function fetchCountries() {
      setLoadingCountries(true)
      try {
        const res = await fetch('/api/locations')
        if (res.ok) {
          const data = await res.json()
          setCountries(data)
        }
      } catch (error) {
        console.error("Failed to load countries:", error)
      } finally {
        setLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [])

  // 2. Fetch Cities when a Country is selected
  const fetchCitiesForCountry = async (countryName) => {
    setLoadingCities(true)
    setCities([]) 
    try {
      const res = await fetch(`/api/locations?country=${encodeURIComponent(countryName)}`)
      if (res.ok) {
        const data = await res.json()
        setCities(data)
      }
    } catch (error) {
      console.error("Failed to load cities:", error)
    } finally {
      setLoadingCities(false)
    }
  }

  // Dropdown Filter Logic
  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryList(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityList(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCountrySelect = (countryName) => {
    setSelectedCountry(countryName)
    setCountrySearch(countryName)
    
    // Reset city selection
    setSelectedCityData(null)
    setCitySearch("")
    setCities([])
    
    setShowCountryList(false)
    fetchCitiesForCountry(countryName)
  }

  const handleCitySelect = (cityData) => {
    setSelectedCityData(cityData)
    setCitySearch(cityData.name)
    setShowCityList(false)
  }

  const handleSearchClick = () => {
    if (selectedCountry && selectedCityData) {
      // Pass Lat/Lon from CSV to the main page
      onSearch({
        city: selectedCityData.name,
        country: selectedCountry,
        latitude: selectedCityData.lat,
        longitude: selectedCityData.lng,
        countryCode: selectedCityData.iso2
      })
    }
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
      <div className="grid grid-cols-1 gap-4 items-end">
        
        {/* Country Dropdown */}
        <div className="relative" ref={countryRef}>
          <label className="block text-sm font-medium text-foreground mb-1">Select Country</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Country..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value)
                setShowCountryList(true)
              }}
              onFocus={() => setShowCountryList(true)}
            />
            <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            
            {loadingCountries ? (
              <Loader2 className="absolute right-3 top-3 text-primary w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown 
                className="absolute right-3 top-3 text-muted-foreground w-4 h-4 cursor-pointer" 
                onClick={() => setShowCountryList(!showCountryList)} 
              />
            )}
          </div>

          {showCountryList && (
            <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center"
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span>{country}</span>
                    {selectedCountry === country && <Check className="w-4 h-4 text-primary" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">No countries found</div>
              )}
            </div>
          )}
        </div>

        {/* City Dropdown */}
        <div className="relative" ref={cityRef}>
          <label className="block text-sm font-medium text-foreground mb-1">Select City</label>
          <div className="relative">
            <input
              type="text"
              placeholder={selectedCountry ? "Search City..." : "Select Country First"}
              disabled={!selectedCountry}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:outline-none ${!selectedCountry ? 'opacity-50 cursor-not-allowed bg-muted' : 'bg-background'}`}
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                setShowCityList(true)
              }}
              onFocus={() => setShowCityList(true)}
            />
            <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            
            {loadingCities ? (
              <Loader2 className="absolute right-3 top-3 text-primary w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown 
                className={`absolute right-3 top-3 text-muted-foreground w-4 h-4 ${selectedCountry ? 'cursor-pointer' : ''}`} 
                onClick={() => selectedCountry && setShowCityList(!showCityList)} 
              />
            )}
          </div>

          {showCityList && selectedCountry && (
            <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={`${city.name}-${city.lat}`}
                    className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center"
                    onClick={() => handleCitySelect(city)}
                  >
                    <span>{city.name}</span>
                    {selectedCityData?.name === city.name && <Check className="w-4 h-4 text-primary" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">
                  {loadingCities ? "Loading cities..." : "No cities found"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="relative">
          <Button 
            className="w-full h-[42px]" 
            disabled={!selectedCountry || !selectedCityData}
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
      </div>
    </div>
  )
}