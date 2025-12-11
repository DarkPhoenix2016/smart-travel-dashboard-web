import { fetchWithRetry, normalizeForecastData, normalizeWeatherData } from "../utils/api-utils"

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function getCurrentWeather(latitude, longitude) {
  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`

  try {
    const data = await fetchWithRetry(url)
    return normalizeWeatherData(data)
  } catch (error) {
    console.error("Error fetching current weather:", error)
    throw error
  }
}

export async function getWeatherForecast(latitude, longitude) {
  const url = `https://pro.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`
  try {
    const data = await fetchWithRetry(url)
    return normalizeForecastData(data)
  } catch (error) {
    console.error("Error fetching weather forecast:", error)
    throw error
  }
}
