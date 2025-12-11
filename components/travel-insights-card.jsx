"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Activity,
    AlertTriangle,
    Bomb,
    Calendar,
    CloudLightning,
    ExternalLink,
    Gavel,
    Info,
    Lock,
    Megaphone,
    ShieldAlert,
    Skull,
    UserMinus
} from "lucide-react"
import { useState } from "react"

export default function TravelInsightsCard({ data, onAddFavorite, isFavorite = false }) {
  const [adding, setAdding] = useState(false)
  const [usDialogOpen, setUsDialogOpen] = useState(false)
  const [ukAlertOpen, setUkAlertOpen] = useState(null) // Stores the content of the open UK alert


  const advisory = data.travelAdvisory || {}
  const ukData = advisory.details.ukData || {}

  // --- 1. RISK INDICATOR LOGIC ---
  const getRiskIndicators = (text) => {
    if (!text) return []
    const lowerText = text.toLowerCase()
    const risks = []

    if (lowerText.includes("crime") || lowerText.includes("robbery")) 
      risks.push({ code: "C", label: "Crime", icon: Gavel, color: "text-purple-500", bg: "bg-purple-500/10" })
    
    if (lowerText.includes("terrorism") || lowerText.includes("terrorist") || lowerText.includes("attack")) 
      risks.push({ code: "T", label: "Terrorism", icon: Bomb, color: "text-red-500", bg: "bg-red-500/10" })
    
    if (lowerText.includes("unrest") || lowerText.includes("demonstration") || lowerText.includes("protest") || lowerText.includes("conflict")) 
      risks.push({ code: "U", label: "Civil Unrest", icon: Megaphone, color: "text-orange-500", bg: "bg-orange-500/10" })
    
    if (lowerText.includes("health") || lowerText.includes("disease") || lowerText.includes("virus") || lowerText.includes("medical")) 
      risks.push({ code: "H", label: "Health", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" })
    
    if (lowerText.includes("disaster") || lowerText.includes("earthquake") || lowerText.includes("cyclone") || lowerText.includes("flood")) 
      risks.push({ code: "N", label: "Natural Disaster", icon: CloudLightning, color: "text-cyan-500", bg: "bg-cyan-500/10" })
    
    if (lowerText.includes("election") || lowerText.includes("event")) 
      risks.push({ code: "E", label: "Time-limited Event", icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" })
    
    if (lowerText.includes("kidnap") || lowerText.includes("hostage")) 
      risks.push({ code: "K", label: "Kidnapping", icon: UserMinus, color: "text-pink-500", bg: "bg-pink-500/10" })
    
    if (lowerText.includes("detention") || lowerText.includes("detain")) 
      risks.push({ code: "D", label: "Wrongful Detention", icon: Lock, color: "text-slate-500", bg: "bg-slate-500/10" })

    if (lowerText.includes("landmine") || lowerText.includes("mines")) 
      risks.push({ code: "O", label: "Landmines", icon: Skull, color: "text-stone-500", bg: "bg-stone-500/10" })

    return risks
  }

  const detectedRisks = getRiskIndicators((advisory.articleSummary + " " + advisory.description).toLowerCase())

  // --- 2. US ADVISORY STYLING ---
  const getLevelStyles = (levelStr) => {
    const level = parseInt(levelStr?.match(/\d+/)?.[0] || "1")
    switch (level) {
      case 4: return { border: "border-l-red-600", bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", badge: "bg-red-600" }
      case 3: return { border: "border-l-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", badge: "bg-orange-600" }
      case 2: return { border: "border-l-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-700 dark:text-yellow-400", badge: "bg-yellow-600" }
      default: return { border: "border-l-green-600", bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", badge: "bg-green-600" }
    }
  }

  const usStyle = getLevelStyles(advisory.level || advisory.details.riskLevel)

  return (
    <Card className="overflow-hidden border-border/50 backdrop-blur-sm">
      
      <div className="p-6 space-y-8">
        
        {/* --- RISK INDICATORS --- */}
        {detectedRisks.length > 0 && (
          <div className="space-y-3">
             <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Identified Risk Factors</h4>
             <div className="flex flex-wrap gap-3">
                {detectedRisks.map((risk, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 ${risk.bg}`}>
                        <risk.icon size={16} className={risk.color} />
                        <span className="text-sm font-medium text-foreground">{risk.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground border border-border/20`}>
                            {risk.code}
                        </span>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* --- US GOVERNMENT ADVISORY --- */}
        <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                🇺🇸 US Government Advisory
            </h4>
            
            <div className={`rounded-r-xl border border-border border-l-4 p-5 ${usStyle.bg} ${usStyle.border}`}>
                <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert className={usStyle.text} size={24} />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${usStyle.badge}`}>
                                {advisory.details.riskLevel || advisory.level}
                            </span>
                            <span className={`font-bold text-lg ${usStyle.text}`}>
                                {advisory.details.riskLevelDescription}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                    {advisory.details.articleSummary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/10">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Updated: {new Date(advisory.details.publishedDate || advisory.lastUpdated).toLocaleDateString()}</span>
                        <a href={advisory.details.articleLink} target="_blank" className="hover:underline flex items-center gap-1">
                            Official Source <ExternalLink size={10} />
                        </a>
                    </div>

                    {/* US READ MORE POPUP */}
                    <Dialog open={usDialogOpen} onOpenChange={setUsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-background/50 hover:bg-background">
                                Read Full Advisory
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] h-[85vh] flex flex-col overflow-hidden">
                            <DialogHeader className="shrink-0">
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-500" />
                                    Full Travel Advisory: {data.location.country}
                                </DialogTitle>
                                <DialogDescription>
                                    Source: US Department of State
                                </DialogDescription>
                            </DialogHeader>
                            {/* Scroll Area Wrapper with Explicit Height Calculation */}
                            <div className="flex-1 min-h-0 mt-2">
                                <ScrollArea className="h-full w-full rounded-md border bg-muted/20 p-4">
                                    <div 
                                        className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 pb-8"
                                        dangerouslySetInnerHTML={{ __html: advisory.details.article || advisory.description }} 
                                    />
                                </ScrollArea>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>

        {/* --- UK FCDO UPDATES --- */}
        {ukData && (
             <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                        🇬🇧 UK FCDO Updates
                    </h4>
                    <a href={ukData.articleLink} target="_blank" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                        View on gov.uk <ExternalLink size={10} />
                    </a>
                </div>

                <div>
                    <h5 className="font-semibold text-foreground">{ukData.articleSummary}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(ukData.publishedDate).toLocaleDateString()}
                    </p>
                </div>

                {ukData.metadata && (
                    <div 
                        className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg [&_dt]:font-bold [&_dd]:mb-2 [&_dd]:ml-0"
                        dangerouslySetInnerHTML={{ __html: ukData.metadata }}
                    />
                )}

                {/* UK ALERTS LIST */}
                {ukData.alerts && ukData.alerts.length > 0 && (
                    <div className="grid gap-3">
                        {ukData.alerts.map((alert, i) => {
                            // Check alert type from the service (object: {type, content}) or legacy string
                            const isRisk = typeof alert === 'object' ? alert.type === 'risk' : false;
                            const content = typeof alert === 'object' ? alert.content : alert;
                            
                            // Styles
                            const alertStyle = isRisk 
                                ? "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-900 dark:text-red-100" 
                                : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 text-yellow-900 dark:text-yellow-100";
                            
                            const icon = isRisk ? <AlertTriangle size={18} className="text-red-600" /> : <Info size={18} className="text-yellow-600" />;

                            return (
                                <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2 ${alertStyle}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0">{icon}</div>
                                        <div className="flex-1 min-w-0">
                                            {/* Truncated Content */}
                                            <div 
                                                className="line-clamp-3 text-sm [&_h2]:font-bold [&_h2]:text-base [&_h2]:mb-1 [&_p]:mb-1 [&_a]:underline"
                                                dangerouslySetInnerHTML={{ __html: content }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Read More Trigger */}
                                    <div className="ml-9">
                                        <Button 
                                            variant="link" 
                                            className="h-auto p-0 text-xs font-semibold underline opacity-80 hover:opacity-100"
                                            onClick={() => setUkAlertOpen(content)}
                                        >
                                            Read More
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* SHARED UK ALERT POPUP */}
                <Dialog open={!!ukAlertOpen} onOpenChange={(open) => !open && setUkAlertOpen(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] h-[85vh] flex flex-col overflow-hidden">
                        <DialogHeader className="shrink-0">
                            <DialogTitle className="flex items-center gap-2">
                                <Info className="text-blue-500" />
                                UK FCDO Alert Detail
                            </DialogTitle>
                            <DialogDescription>
                                Source: GOV.UK Foreign Travel Advice
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 min-h-0 mt-2">
                            <ScrollArea className="h-full w-full rounded-md border bg-muted/20 p-4">
                                <div 
                                    className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 pb-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: ukAlertOpen || "" }} 
                                />
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>

             </div>
        )}

      </div>
    </Card>
  )
}