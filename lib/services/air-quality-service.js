import { fetchWithRetry, normalizeAirQualityData, normalizeAirQualityForecast } from "../utils/api-utils"

const OPENWEATHER_AQ_URL = "http://api.openweathermap.org/data/2.5/air_pollution"

export async function getAirQuality(latitude, longitude) {
  const url = `${OPENWEATHER_AQ_URL}?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHERMAP_API_KEY}`

  try {
    const data = await fetchWithRetry(url)
    return normalizeAirQualityData(data)
  } catch (error) {
    console.error("Error fetching air quality:", error)
    throw error
  }
}

export async function getAirQualityForecast(latitude, longitude) {
  const url = `${OPENWEATHER_AQ_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHERMAP_API_KEY}`

  try {
    const data = await fetchWithRetry(url)
    return normalizeAirQualityForecast(data) 
  } catch (error) {
    console.error("Error fetching air quality forecast:", error)
    throw error
  }
}

export function getAQILevel(aqi) {
  const levels = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  }
  return levels[aqi] || "Unknown"
}

export function getAQIColor(aqi) {
  const colors = {
    1: "#10b981", // green
    2: "#84cc16", // lime
    3: "#f59e0b", // amber
    4: "#ef4444", // red
    5: "#7c3aed", // violet
  }
  return colors[aqi] || "#6b7280" // gray
}
