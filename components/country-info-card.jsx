"use client"

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Clock,
    Coins,
    Flag,
    Globe,
    Languages,
    Map as MapIcon,
    Phone,
    Users
} from "lucide-react";

export default function CountryInfoCard({ country }) {
  if (!country) return null;

  // Helper to format numbers (e.g. 1,000,000)
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  return (
    <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm pt-0">
      
      {/* 1. HERO SECTION: Flag & Name */}
      <div className="relative h-48 w-full overflow-hidden group">
        {/* Background Flag with Blur */}
        <div 
            className="absolute inset-0 bg-cover bg-center blur-m opacity-30 scale-100 group-hover:scale-125 transition-transform duration-700"
            style={{ backgroundImage: `url(${country.flags?.svg || country.flag})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
                <div className="relative h-32 w-64 rounded-md shadow-lg overflow-hidden border border-border/50 bg-muted">
                    <img 
                        src={country.flags?.svg || country.flag} 
                        alt={country.name} 
                        className="h-full w-full object-fill"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{country.name}</h2>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <MapIcon size={12} /> {country.capital}
                    </p>
                </div>
            </div>
            {country.alpha3Code && (
                <div className="text-4xl font-black text-foreground/50 tracking-widest select-none">
                    {country.alpha3Code}
                </div>
            )}
        </div>
      </div>

      {/* 2. MAIN DETAILS GRID */}
      <div className="p-6 grid gap-6">
        
        {/* Key Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    <Users size={12} /> Population
                </div>
                <p className="text-sm font-semibold">{formatNumber(country.population)}</p>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    <Globe size={12} /> Region
                </div>
                <p className="text-sm font-semibold">{country.subregion || country.region}</p>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    <Flag size={12} /> Demonym
                </div>
                <p className="text-sm font-semibold">{country.demonym}</p>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    <MapIcon size={12} /> Area
                </div>
                <p className="text-sm font-semibold">{formatNumber(country.area)} km²</p>
            </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/50" />

        {/* Travel Essentials Section */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-4">
                
                {/* Timezones (Crucial for Travelers) */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-md">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase mb-1">Time Zones</p>
                        <div className="flex flex-wrap gap-1.5">
                            {country.timezones?.slice(0, 4).map((tz) => (
                                <Badge key={tz} variant="secondary" className="text-[10px] px-1.5 h-5">
                                    {tz}
                                </Badge>
                            ))}
                            {country.timezones?.length > 4 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                    +{country.timezones.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Connectivity (Phone & Web) */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-purple-500/10 text-purple-600 rounded-md">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase mb-1">Connectivity</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            <div>
                                <span className="text-[10px] text-muted-foreground block">Calling Code</span>
                                <span className="text-sm  font-medium">+{country.callingCodes?.[0]}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground block">Internet TLD</span>
                                <span className="text-sm  font-medium">{country.topLevelDomain?.[0]}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column */}
            <div className="space-y-4">

                {/* Currency */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-md">
                        <Coins size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase mb-1">Currency</p>
                        {country.currencies?.map((curr) => (
                            <div key={curr.code} className="flex items-baseline gap-2">
                                <span className="text-sm font-semibold">{curr.name}</span>
                                <Badge variant="outline" className=" text-[10px] border-yellow-500/30 text-yellow-600">
                                    {curr.code} ({curr.symbol})
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-green-500/10 text-green-600 rounded-md">
                        <Languages size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase mb-1">Languages</p>
                        <div className="flex flex-wrap gap-1.5">
                            {country.languages?.map((lang) => (
                                <span key={lang.iso639_1} className="text-sm text-foreground/80">
                                    {lang.name} <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

    </Card>
  )
}