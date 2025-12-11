"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { COUNTRY_MAPPING } from "@/lib/utils/country-mapping"
import { scaleLinear } from "d3-scale"
import { Loader2, Minus, Plus, RefreshCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export default function GlobalSafetyMap() {
  const [svgContent, setSvgContent] = useState("")
  const [advisoryData, setAdvisoryData] = useState({})
  const [loading, setLoading] = useState(true)
  
  // --- PERFORMANCE FIX: Use Refs instead of State for animation ---
  const transformRef = useRef({ k: 1, x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const startPanRef = useRef({ x: 0, y: 0 })
  const mapContentRef = useRef(null) // Targets the inner div holding the SVG
  
  // Ref to distinguish clicks from drags
  const hasMovedRef = useRef(false)

  // Tooltip State (Still needs state to render the popup)
  const [tooltip, setTooltip] = useState({ show: false, content: "", x: 0, y: 0, level: 0 })

  const colorScale = scaleLinear()
    .domain([1, 2, 3, 4])
    .range(["#4ade80", "#facc15", "#fb923c", "#ef4444"]) 

  const levelDescriptions = {
    1: "Exercise Normal Precautions",
    2: "Exercise Increased Caution",
    3: "Reconsider Travel",
    4: "Do Not Travel"
  }

  // --- 1. HELPER: Apply Transform Directly to DOM (Zero Re-renders) ---
  const updateTransform = () => {
    if (mapContentRef.current) {
      const { x, y, k } = transformRef.current
      // Using translate3d enables Hardware Acceleration on mobile
      mapContentRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`
    }
  }

  // --- 2. SVG GENERATOR ---
  const generateColoredSVG = (rawSVG, advisoryData) => {
    if (typeof window === 'undefined') return rawSVG

    const parser = new DOMParser()
    const doc = parser.parseFromString(rawSVG, "image/svg+xml")
    const svg = doc.querySelector("svg")

    if (!svg) return rawSVG

    const styles = doc.querySelectorAll("style")
    styles.forEach(el => el.remove())
    svg.removeAttribute("width")
    svg.removeAttribute("height")
    
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
    
    const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style")
    styleEl.textContent = `
      .country-path { transition: opacity 0.2s, stroke 0.2s; }
      .country-path:hover { opacity: 0.8; stroke: #334155 !important; stroke-width: 0.8px; }
    `
    svg.prepend(styleEl)

    Object.entries(COUNTRY_MAPPING).forEach(([code, countryName]) => {
      const element = doc.getElementById(code)
      if (element) {
        const score = advisoryData[countryName] || 0
        const fillColor = score > 0 ? colorScale(score) : "#e2e8f0"
        
        element.removeAttribute("style") 
        element.removeAttribute("fill")
        
        element.setAttribute("fill", fillColor)
        element.setAttribute("stroke", "#94a3b8")
        element.setAttribute("stroke-width", "0.5")
        element.setAttribute("class", "country-path")
        element.setAttribute("data-country", countryName)
        element.setAttribute("data-level", score)
      }
    })

    return new XMLSerializer().serializeToString(doc)
  }

  // --- 3. FETCH DATA ---
  useEffect(() => {
    async function init() {
      try {
        const [svgRes, apiRes] = await Promise.all([
            fetch("/data/world.svg"),
            fetch("/api/travel/all")
        ])
        
        const rawSvgText = await svgRes.text()
        let data = {}
        if (apiRes.ok) data = await apiRes.json()

        const finalSVG = generateColoredSVG(rawSvgText, data)
        setSvgContent(finalSVG)
      } catch (error) {
        console.error("Error initializing map:", error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // --- 4. OPTIMIZED INPUT HANDLERS ---
  
  const handleZoom = (delta) => {
    const prev = transformRef.current
    const newK = Math.max(0.5, Math.min(8, prev.k + delta))
    transformRef.current = { ...prev, k: newK }
    updateTransform()
  }

  const handleReset = () => {
    transformRef.current = { k: 1, x: 0, y: 0 }
    updateTransform()
  }

  // -- Start Interaction --
  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true
    hasMovedRef.current = false
    // Calculate offset relative to current position
    startPanRef.current = { 
        x: clientX - transformRef.current.x, 
        y: clientY - transformRef.current.y 
    }
  }

  // -- Move Interaction (Direct DOM Update) --
  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return
    
    // Check if moved > 3px to mark as drag
    const dx = Math.abs(clientX - startPanRef.current.x - transformRef.current.x)
    const dy = Math.abs(clientY - startPanRef.current.y - transformRef.current.y)
    
    if (dx > 3 || dy > 3) {
        hasMovedRef.current = true
    }

    // Update Ref
    transformRef.current.x = clientX - startPanRef.current.x
    transformRef.current.y = clientY - startPanRef.current.y
    
    // Update DOM directly
    updateTransform()
  }

  // -- Desktop Handlers --
  const onMouseDown = (e) => handleStart(e.clientX, e.clientY)
  
  const onMouseMove = (e) => {
    e.preventDefault()
    if (isDraggingRef.current) {
      handleMove(e.clientX, e.clientY)
      return
    }
    
    // Hover Tooltip (Desktop Only)
    // Only check for tooltip if we are NOT dragging and map is stable
    if (!hasMovedRef.current) {
        const target = e.target.closest?.(".country-path")
        if (target) {
            const countryName = target.getAttribute("data-country")
            const level = parseInt(target.getAttribute("data-level") || "0")
            // Debounce/Check if tooltip actually needs update to save renders
            if (tooltip.content !== countryName) {
                setTooltip({ show: true, content: countryName, level, x: e.clientX, y: e.clientY })
            } else {
                // Just update position without full re-render if possible (simplified here)
                setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
            }
        } else if (tooltip.show) {
            setTooltip(prev => ({ ...prev, show: false }))
        }
    }
  }

  const onMouseUp = () => { isDraggingRef.current = false }
  
  // -- Touch Handlers (Mobile) --
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
       handleStart(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const onTouchMove = (e) => {
    if (e.touches.length === 1) {
       handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const onTouchEnd = () => { isDraggingRef.current = false }

  // -- Click / Tap Handler --
  const handleClick = (e) => {
    if (hasMovedRef.current) return // Ignore clicks after dragging

    const target = e.target.closest?.(".country-path")
    if (target) {
        const countryName = target.getAttribute("data-country")
        const level = parseInt(target.getAttribute("data-level") || "0")
        
        let clientX = e.clientX 
        let clientY = e.clientY

        // Fix for touch events sometimes missing coords in React synthetic event
        if (!clientX && e.nativeEvent.changedTouches && e.nativeEvent.changedTouches.length > 0) {
            clientX = e.nativeEvent.changedTouches[0].clientX
            clientY = e.nativeEvent.changedTouches[0].clientY
        }

        setTooltip({
            show: true,
            content: countryName,
            level: level,
            x: clientX,
            y: clientY
        })
    } else {
        setTooltip(prev => ({ ...prev, show: false }))
    }
  }

  return (
    <Card className="mt-20 w-full group p-0 border border-border overflow-hidden h-[500px] md:h-[600px] relative bg-white shadow-sm group">
      
      {/* Responsive Legend (Smaller on Mobile) */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur p-2 md:p-4 rounded-xl border border-border shadow-lg pointer-events-none w-[140px] md:w-auto">
        <h2 className="text-xs md:text-xl font-bold text-slate-800">Global Safety Map</h2>
        <p className="text-muted-foreground text-xs italic mt-1">
          Source: USA Travel Advisory Data Map
        </p>
        <div className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-3">
            {[
                { l: 1, c: "#4ade80", t: "Normal" },
                { l: 2, c: "#facc15", t: "Caution" },
                { l: 3, c: "#fb923c", t: "Reconsider" },
                { l: 4, c: "#ef4444", t: "Do Not Travel" }
            ].map((item) => (
                <div key={item.l} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-slate-600">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0" style={{ background: item.c }}></div> 
                    <span className="font-medium">Lvl {item.l}:</span> <span className="truncate">{item.t}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur p-2 rounded-lg border border-border shadow-md">
        <Button variant="outline" size="icon" onClick={() => handleZoom(0.5)}><Plus className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom(-0.5)}><Minus className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={handleReset}><RefreshCcw className="h-4 w-4" /></Button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
        </div>
      )}

      {/* Map Container */}
      <div 
        className="w-6xl h-150 bg-white flex items-center justify-center touch-none" // Critical: touch-none stops scrolling
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { isDraggingRef.current = false; setTooltip(p => ({...p, show: false})) }}
        onClick={handleClick}

        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
            ref={mapContentRef}
            className="w-full h-200 flex items-center justify-center origin-center will-change-transform" // Optimized CSS
            // Initial render only, updates happen via ref
            style={{ transform: `translate3d(0px, 0px, 0) scale(1)` }} 
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* Tooltip */}
      {tooltip.show && typeof document !== 'undefined' && createPortal(
        <div 
            className="fixed z-9999 px-3 py-2 md:px-4 md:py-3 text-sm text-white bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl pointer-events-none backdrop-blur-sm"
            style={{ 
                left: tooltip.x, 
                top: tooltip.y,
                transform: 'translate(-50%, -130%)', // Moved up slightly more for mobile finger clearance
                minWidth: '160px',
                maxWidth: '220px',
                textAlign: 'center'
            }}
        >
            <div className="font-bold text-base md:text-lg mb-0.5 md:mb-1">{tooltip.content}</div>
            
            {tooltip.level > 0 ? (
                <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 bg-white/10 rounded-full py-0.5 px-2 w-fit mx-auto">
                        <span 
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-[0_0_8px_currentColor]" 
                            style={{ 
                                backgroundColor: colorScale(tooltip.level),
                                color: colorScale(tooltip.level) 
                            }}
                        />
                        <span className="font-semibold text-xs md:text-sm text-slate-100">Level {tooltip.level}</span>
                    </div>
                    <div 
                        className="text-[10px] md:text-xs font-bold uppercase tracking-wider"
                        style={{ color: colorScale(tooltip.level) }}
                    >
                        {levelDescriptions[tooltip.level]}
                    </div>
                </div>
            ) : (
                <div className="text-xs text-slate-400 italic">No Data Available</div>
            )}
        </div>,
        document.body
      )}
    </Card>
  )
}