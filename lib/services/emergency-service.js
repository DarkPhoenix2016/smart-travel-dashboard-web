import connectDB from "@/lib/db";
import EmergencyInfo from "@/models/EmergencyInfo";
import axios from "axios";

const CACHE_TTL = 24 * 60 * 60 * 1000;
const EXTERNAL_API_URL = "https://emergencynumberapi.com/api/data/all";

export async function getEmergencyData(countryName, countryCode) {
  await connectDB();

  const cutoffDate = new Date(Date.now() - CACHE_TTL);
  
  // 1. Build Query: Prefer Code, Fallback to Name
  let query = {};
  if (countryCode) {
    query = { isoCode: countryCode.toUpperCase() };
  } else {
    query = { countryName: { $regex: new RegExp(`^${countryName}$`, "i") } };
  }

  const existingRecord = await EmergencyInfo.findOne(query);

  if (existingRecord && existingRecord.updatedAt > cutoffDate) {
    console.log(`✅ Emergency Cache Hit: ${countryName}`);
    return existingRecord;
  }

  console.log(`🌍 Emergency Cache Miss: ${countryName}. Fetching external API...`);
  
  try {
    const response = await axios.get(EXTERNAL_API_URL);
    
    let apiData = response.data;
    if (!Array.isArray(apiData) && apiData?.data && Array.isArray(apiData.data)) {
        apiData = apiData.data;
    }

    if (!Array.isArray(apiData)) {
        if (existingRecord) return existingRecord;
        return null;
    }

    const getNums = (obj) => {
        if (!obj || !Array.isArray(obj.All)) return [];
        return obj.All.filter(num => num && num !== "null" && num !== "");
    };

    const bulkOps = apiData.map((item) => {
      if (!item.Country || !item.Country.Name) return null;

      return {
        updateOne: {
          filter: { countryName: item.Country.Name }, 
          update: { 
            $set: { 
                countryName: item.Country.Name,
                isoCode: item.Country.ISOCode || "",
                fire: getNums(item.Fire),
                ambulance: getNums(item.Ambulance),
                police: getNums(item.Police),
                dispatch: getNums(item.Dispatch),
                member_112: item.Member_112 || false,
                localOnly: item.LocalOnly || false,
                updatedAt: new Date() 
            } 
          },
          upsert: true,
        },
      };
    }).filter(Boolean);

    if (bulkOps.length > 0) {
      await EmergencyInfo.bulkWrite(bulkOps);
    }

    // Return using the same query
    return await EmergencyInfo.findOne(query);

  } catch (error) {
    console.error("Failed to fetch emergency data:", error.message);
    if (existingRecord) return existingRecord;
    return null;
  }
}