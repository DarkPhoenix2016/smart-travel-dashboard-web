"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ArrowRightLeft, Check, ChevronsUpDown, Coins, Loader2, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"

export default function CurrencyCard({ localCurrencyCode }) {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Converter State
  const [amount, setAmount] = useState(1)
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState(localCurrencyCode || "EUR")
  const [convertedAmount, setConvertedAmount] = useState(0)

  useEffect(() => {
    fetchRates();
  }, [])

  useEffect(() => {
    if (localCurrencyCode && rates?.rates[localCurrencyCode]) {
        setToCurrency(localCurrencyCode);
    }
  }, [localCurrencyCode, rates])

  const fetchRates = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/currency")
      if (res.ok) {
        const data = await res.json()
        setRates(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Conversion Logic
  useEffect(() => {
    if (!rates) return;
    const fromRate = rates.rates[fromCurrency] || 1;
    const toRate = rates.rates[toCurrency] || 1;
    const result = (amount / fromRate) * toRate;
    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency, rates])

  // Fix 3: Swap Function
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Helper: Format Number with commas
  const formatNum = (num) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  }

  if (loading) {
    return (
        <Card className="p-6 h-[300px] flex items-center justify-center border-border/50 bg-card/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary" />
        </Card>
    )
  }

  if (!rates) return null;

  const targetCode = localCurrencyCode || "EUR";
  const targetRate = rates.rates[targetCode] || 0;
  const currencyList = Object.keys(rates.rates).sort(); // Sorted list for search

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-full">
                <Coins size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Currency Exchange</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRates} title="Refresh Rates">
            <RefreshCcw size={16} className="text-muted-foreground" />
        </Button>
      </div>

      {/* 1. Quick Reference */}
      {targetRate > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/10 rounded-xl border border-border/50">
            <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">1 USD equals</p>
                <p className="text-lg font-bold text-foreground">
                    {formatNum(targetRate)} {targetCode}
                </p>
            </div>
            <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground mb-1">1 {targetCode} equals</p>
                <p className="text-lg font-bold text-foreground">
                    {formatNum(1 / targetRate)} USD
                </p>
            </div>
          </div>
      )}

      {/* 2. Major Currencies */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Major Currencies</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
                { code: "EUR", name: "Euro" },
                { code: "GBP", name: "Pound" },
                { code: "JPY", name: "Yen" },
                { code: "CNY", name: "Yuan" }
            ].map((curr) => {
                const rate = rates.rates[curr.code];
                const localValue = (1 / rate) * targetRate;
                
                return (
                    <div key={curr.code} className="p-2 bg-background/50 rounded-lg border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground font-bold">{curr.code}</p>
                        <p className="text-sm font-semibold">{formatNum(localValue)} {targetCode}</p>
                    </div>
                )
            })}
        </div>
      </div>

      {/* 3. Interactive Converter */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Converter</h4>
        
        <div className="flex flex-col gap-4">
            
            {/* FROM ROW */}
            <div className="flex gap-2">
                <CurrencyCombobox 
                    value={fromCurrency} 
                    onChange={setFromCurrency} 
                    options={currencyList} 
                />
                <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 text-right  text-lg h-12"
                />
                {/* Fix 1: Searchable Combobox on Right */}
                
            </div>

            {/* SWAP BUTTON (Fix 3) */}
            <div className="flex justify-center -my-2 relative z-10">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border shadow-sm bg-background hover:bg-muted"
                    onClick={handleSwap}
                >
                    <ArrowRightLeft size={14} className="text-muted-foreground" />
                </Button>
            </div>

            {/* TO ROW */}
            <div className="flex gap-2">
                {/* Searchable Combobox on Right */}
                  <CurrencyCombobox 
                      value={toCurrency} 
                      onChange={setToCurrency} 
                      options={currencyList} 
                  />
                <div className="flex-1 flex items-center px-3 h-12 rounded-md border border-input bg-secondary/20 text-right text-lg font-bold">
                    {/* Fix 2: Number Formatting */}
                    {formatNum(convertedAmount)}
                </div>
                
            </div>
        </div>
      </div>

    </Card>
  )
}

// --- SUB-COMPONENT: SEARCHABLE COMBOBOX ---
function CurrencyCombobox({ value, onChange, options }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[110px] h-12 justify-between  font-bold"
        >
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {options.map((code) => (
                <CommandItem
                  key={code}
                  value={code}
                  onSelect={(currentValue) => {
                    onChange(currentValue.toUpperCase())
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {code}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}