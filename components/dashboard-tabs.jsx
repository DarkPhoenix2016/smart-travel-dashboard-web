"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function DashboardTabs({ tabs, defaultTab = "general", className }) {
  return (
    <Tabs defaultValue={defaultTab} className={cn("w-full space-y-6", className)}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="flex items-center gap-2 py-2.5 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value} 
          className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}