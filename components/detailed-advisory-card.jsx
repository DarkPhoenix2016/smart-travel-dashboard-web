"use client"

import { format } from "date-fns"
import {
    Activity,
    AlertTriangle,
    Calendar,
    CloudSun,
    Info,
    Languages,
    Plane,
    Scale,
    Shield,
    Stethoscope
} from "lucide-react"
import { useState } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DetailedAdvisoryCard({ data }) {
  const [selectedItem, setSelectedItem] = useState(null)

  if (!data) return null

  // Helper to safely format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  // Helper to determine status color
  const getStatusColor = (state) => {
    const s = parseInt(state)
    if (s === 0) return "bg-green-100 text-green-800 border-green-200"
    if (s === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  // --- Sub-Item Renderer (The Pulsing Cards) ---
  const renderSubItems = (items) => {
    if (!items || items.length === 0) return null
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {items.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedItem(item)}
            className="group relative cursor-pointer p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/50 transition-all hover:shadow-sm hover:border-primary/30"
          >
            {/* Pulse Indicator */}
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            
            <div className="flex items-center gap-2 mb-1 pr-4">
              <Activity size={14} className="text-primary" />
              <h4 className="font-semibold text-sm truncate">{item.category}</h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            <p className="text-[10px] text-primary mt-2 font-medium group-hover:underline">
              Read more
            </p>
          </div>
        ))}
      </div>
    )
  }

  // --- Flatten Health Data Helper ---
  // Health object is complex (nested objects), so we flatten it for display
  const getHealthItems = () => {
    let items = [...(data.health?.healthInfo || [])]
    
    // Extract diseases/vaccines if available
    if (data.health?.diseasesAndVaccinesInfo) {
      Object.entries(data.health.diseasesAndVaccinesInfo).forEach(([key, val]) => {
        if (Array.isArray(val)) {
            val.forEach(v => items.push({ ...v, category: `${key}: ${v.category}` }))
        }
      })
    }
    return items
  }

  return (
    <>
      <div className="space-y-6">
        
        {/* 1. HEADER CARD (Summary) */}
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                   {data.countryName} <span className="text-lg font-mono text-muted-foreground">({data.code})</span>
                </CardTitle>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Published: {formatDate(data.publishedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Languages size={14} /> Lang: {data.language?.name || data.language}
                  </span>
                </div>
              </div>
              
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(data.advisoryState)}`}>
                {data.advisoryState === 0 ? "Normal Precautions" : "Exercise Caution"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Advisory Text */}
            <div className="p-3 bg-secondary/20 rounded-md border border-border/50">
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500"/> 
                Current Advisory
              </h4>
              <p className="text-sm font-medium">{data.advisoryText}</p>
            </div>

            {/* Recent Updates */}
            {data.recentUpdates && (
              <div className="text-sm">
                <span className="font-semibold text-muted-foreground">Recent Updates: </span>
                <span>{data.recentUpdates}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. COLLAPSIBLE SECTIONS */}
        <Accordion type="single" collapsible className="w-full bg-card/40 rounded-xl border border-border/50 overflow-hidden">
          
          {/* Advisory / Regional */}
          <AccordionItem value="advisory">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-blue-500" />
                <span>Regional Advisories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.advisories?.description}</p>
               {renderSubItems(data.advisories?.regionalAdvisories)}
            </AccordionContent>
          </AccordionItem>

          {/* Safety */}
          <AccordionItem value="safety">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-red-500" />
                <span>Safety & Security</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.safety?.description}</p>
               {renderSubItems(data.safety?.safetyInfo)}
            </AccordionContent>
          </AccordionItem>

          {/* Entry / Exit */}
          <AccordionItem value="entry">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Plane size={18} className="text-indigo-500" />
                <span>Entry & Exit Requirements</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.entryExitRequirement?.description}</p>
               {renderSubItems(data.entryExitRequirement?.requirementInfo)}
            </AccordionContent>
          </AccordionItem>

          {/* Health */}
          <AccordionItem value="health">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Stethoscope size={18} className="text-green-500" />
                <span>Health & Vaccines</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.health?.description}</p>
               {renderSubItems(getHealthItems())}
            </AccordionContent>
          </AccordionItem>

          {/* Law & Culture */}
          <AccordionItem value="laws">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Scale size={18} className="text-orange-500" />
                <span>Laws & Culture</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.lawAndCulture?.description}</p>
               {renderSubItems(data.lawAndCulture?.lawAndCultureInfo)}
            </AccordionContent>
          </AccordionItem>

          {/* Climate */}
          <AccordionItem value="climate">
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <CloudSun size={18} className="text-yellow-500" />
                <span>Climate & Disasters</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <p className="text-sm text-muted-foreground mb-4">{data.climate?.description}</p>
               {renderSubItems(data.climate?.climateInfo)}
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>

      {/* 3. DETAILS POPUP DIALOG */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="text-primary h-5 w-5" />
              {selectedItem?.category}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-2">
            <DialogDescription className="text-foreground text-sm leading-relaxed whitespace-pre-line">
              {selectedItem?.description}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </>
  )
}