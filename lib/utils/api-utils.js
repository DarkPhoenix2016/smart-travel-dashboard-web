export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} retries: ${error.message}`)
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}

export function createCacheKey(...parts) {
  return parts.join(":")
}

export function normalizeAirQualityData(data) {
  return {
    aqi: data.list[0].main.aqi,
    components: {
      pm2_5: Math.round(data.list[0].components.pm2_5),
      pm10: Math.round(data.list[0].components.pm10),
      no2: Math.round(data.list[0].components.no2),
      so2: Math.round(data.list[0].components.so2),
      o3: Math.round(data.list[0].components.o3),
      co: Math.round(data.list[0].components.co),
    },
  }
}
export function normalizeAirQualityForecast(data) {
  // OpenWeatherMap AQ Forecast is hourly (96 items for 4 days).
  // Filter every 12th item to get ~2 points per day (e.g. 12 AM and 12 PM approx)
  return data.list.filter((_, index) => index % 12 === 0).map((item) => ({
    date: new Date(item.dt * 1000),
    aqi: item.main.aqi,
    components: item.components // Include components for the tooltip
  }))
}

export function normalizeWeatherData(data) {
  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].main,
    icon: data.weather[0].icon,
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    pressure: data.main.pressure,
    timezone: data.timezone, 
  }
}
export function normalizeForecastData(data) {
  return data.list.map((item) => ({
    date: new Date(item.dt * 1000),
    temperature: Math.round(item.main.temp),
    description: item.weather[0].main,
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed * 3.6),
  }))
}



