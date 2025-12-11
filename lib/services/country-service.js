import connectDB from "@/lib/db";
import CountryInfo from "@/models/CountryInfo";
import axios from "axios";

const CACHE_TTL = 24 * 60 * 60 * 1000; 
const EXTERNAL_API_URL = "https://www.apicountries.com/countries";

export async function getCountryData(countryName, countryCode) {
  await connectDB();

  const cutoffDate = new Date(Date.now() - CACHE_TTL);
  
  // 1. Build Query: Prefer Code, Fallback to Name
  let query = {};
  if (countryCode) {
    query = { alpha2Code: countryCode.toUpperCase() };
  } else {
    query = { name: { $regex: new RegExp(`^${countryName}$`, "i") } };
  }

  const existingRecord = await CountryInfo.findOne(query);

  if (existingRecord && existingRecord.updatedAt > cutoffDate) {
    console.log(`✅ Country Cache Hit: ${existingRecord.name}`);
    return existingRecord;
  }

  console.log(`🌍 Country Cache Miss: ${countryName}. Fetching external API...`);
  
  try {
    const response = await axios.get(EXTERNAL_API_URL);
    const allCountries = response.data;

    const bulkOps = allCountries.map((country) => ({
      updateOne: {
        filter: { name: country.name },
        update: { 
            $set: { ...country, updatedAt: new Date() } 
        },
        upsert: true, 
      },
    }));

    if (bulkOps.length > 0) {
      await CountryInfo.bulkWrite(bulkOps);
      console.log(`💾 Updated ${bulkOps.length} countries in DB.`);
    }

    // Return the specific country using the same query
    return await CountryInfo.findOne(query);

  } catch (error) {
    console.error("Failed to fetch country data:", error.message);
    if (existingRecord) return existingRecord;
    throw error;
  }
}