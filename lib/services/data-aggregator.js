import { getTravelAdvisory } from "./advisory/travel-advisory-service";
import { getAirQuality, getAirQualityForecast } from "./air-quality-service";
import { getCountryData } from "./country-service";
import { getEmergencyData } from "./emergency-service";
import { getCurrentWeather, getWeatherForecast } from "./weather-service";

export async function aggregateTravelData(latitude, longitude, country, city, countryCode) {
  try {
    console.log(`🌍 Fetching external APIs for ${city}, ${country} (${countryCode || 'No Code'})...`);

    const [
      weather, 
      forecast, 
      airQuality, 
      aqForecast, 
      rawAdvisory, 
      countryInfoDoc,
      emergencyInfoDoc,

    ] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      getWeatherForecast(latitude, longitude),
      getAirQuality(latitude, longitude),
      getAirQualityForecast(latitude, longitude),
      getTravelAdvisory(country),
      getCountryData(country, countryCode),
      getEmergencyData(country, countryCode),
    ]);

    // --- CONVERT TO PLAIN OBJECTS (Safeguard) ---
    
    const countryInfo = countryInfoDoc && typeof countryInfoDoc.toObject === 'function' 
        ? countryInfoDoc.toObject() 
        : countryInfoDoc;

    const emergencyInfo = emergencyInfoDoc && typeof emergencyInfoDoc.toObject === 'function' 
        ? emergencyInfoDoc.toObject() 
        : emergencyInfoDoc;


    console.log(`STATS: CountryInfo: ${countryInfo ? 'Found' : 'MISSING'}, EmergencyInfo: ${emergencyInfo ? 'Found' : 'MISSING'}`);


    const advisoryLevelStr = rawAdvisory.level || rawAdvisory.riskLevel || "Unknown";
    let safeScore = 0;
    if (typeof rawAdvisory.score === 'number') {
        safeScore = rawAdvisory.score;
    } else {
        const match = advisoryLevelStr.toString().match(/(\d+)/);
        safeScore = match ? parseInt(match[0]) : 0;
    }

    const uiAdvisory = {
        level: advisoryLevelStr,
        score: safeScore,
        description: rawAdvisory.description || rawAdvisory.articleSummary || rawAdvisory.riskLevelDescription || "No advisory data available",
        details: rawAdvisory 
    };

    const aggregatedData = {
      location: { city, country, countryCode, latitude, longitude }, 
      timezone: weather.timezone,
      weather,
      forecast,
      airQuality,
      airQualityForecast: aqForecast,
      travelAdvisory: uiAdvisory,
      countryInfo: countryInfo || null, 
      emergencyInfo: emergencyInfo || null, 
            
      timestamp: new Date(),
    };

    return aggregatedData;

  } catch (error) {
    console.error("Error aggregating travel data:", error);
    throw error;
  }
}