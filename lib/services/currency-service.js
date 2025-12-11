import connectDB from "@/lib/db";
import CurrencyRate from "@/models/CurrencyRate";
import axios from "axios";

const API_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL = 60 * 60 * 1000; // 1 Hour

export async function getCurrencyRates() {
  await connectDB();

  // 1. Check DB for fresh data
  const cutoffDate = new Date(Date.now() - CACHE_TTL);
  
  const cachedRates = await CurrencyRate.findOne({
    createdAt: { $gte: cutoffDate }
  }).sort({ createdAt: -1 });

  if (cachedRates) {
    console.log("✅ Currency Cache Hit");
    return {
        base: cachedRates.base,
        rates: Object.fromEntries(cachedRates.rates),
        lastUpdate: cachedRates.lastUpdate
    };
  }

  console.log("🌍 Currency Cache Miss. Fetching external API...");

  try {
    const response = await axios.get(API_URL);
    const data = response.data;

    if (data.result !== "success") throw new Error("API Error");

    // --- FIX: Safe Date Parsing ---
    // Use unix timestamp if available, otherwise default to now
    const lastUpdateDate = data.time_last_update_unix 
        ? new Date(data.time_last_update_unix * 1000) 
        : new Date();

    const nextUpdateDate = data.time_next_update_unix 
        ? new Date(data.time_next_update_unix * 1000) 
        : new Date(Date.now() + CACHE_TTL);

    // 2. Save to DB
    await CurrencyRate.create({
        base: data.base_code,
        rates: data.rates,
        lastUpdate: lastUpdateDate,
        nextUpdate: nextUpdateDate
    });

    return {
        base: data.base_code,
        rates: data.rates,
        lastUpdate: lastUpdateDate
    };

  } catch (error) {
    console.error("Currency Service Error:", error.message);
    
    // Fallback: If API fails but we have OLD data in DB, return it
    if (cachedRates) {
        return {
            base: cachedRates.base,
            rates: Object.fromEntries(cachedRates.rates),
            lastUpdate: cachedRates.lastUpdate
        };
    }
    return null;
  }
}