import connectDB from "@/lib/db";
import { aggregateTravelData } from "@/lib/services/data-aggregator";
import TravelRecord from "@/models/TravelRecord";
import { NextResponse } from "next/server";

const generateUniqueKey = (country, city) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const hour = now.getHours();
  return `${country.trim().toLowerCase()}-${city
    .trim()
    .toLowerCase()}-${dateStr}-${hour}`;
};

export async function POST(request) {
  try {
    const { latitude, longitude, country, city, countryCode, userId } =
      await request.json();

    if (!latitude || !longitude || !country || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    const uniqueKey = generateUniqueKey(country, city);

    // ---------------------------------------------------------
    // 1. GLOBAL READ (Cache Check)
    // ---------------------------------------------------------
    const cachedRecord = await TravelRecord.findOne({ uniqueKey });

    if (cachedRecord) {
      console.log(`✅ Global Cache Hit for ${uniqueKey}`);
      return NextResponse.json({
        data: cachedRecord,
        source: "cache",
      });
    }

    // ---------------------------------------------------------
    // 2. FETCH LIVE (Aggregator returns everything)
    // ---------------------------------------------------------
    console.log(`🌍 Cache Miss (${uniqueKey}). Fetching live API...`);
    const liveData = await aggregateTravelData(
      latitude,
      longitude,
      country,
      city,
      countryCode
    );

    // ---------------------------------------------------------
    // 3. ATOMIC WRITE & CLEANUP
    // ---------------------------------------------------------
    try {
      // FIX: Use 'liveData' directly instead of 'recordToSave'
      await TravelRecord.findOneAndUpdate(
        { uniqueKey },
        {
          $set: {
            ...liveData, // Save the full aggregated data
            uniqueKey,
            ...(userId && { userId }),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Cleanup Old Records (Removes duplicates from PAST hours)
      await TravelRecord.deleteMany({
        "location.city": { $regex: new RegExp(`^${city}$`, "i") },
        "location.country": { $regex: new RegExp(`^${country}$`, "i") },
        uniqueKey: { $ne: uniqueKey },
      });

      console.log(`💾 Atomic Save & Cleanup successful: ${uniqueKey}`);
    } catch (dbError) {
      console.error("DB Write Error:", dbError.message);
    }

    // ---------------------------------------------------------
    // 4. RESPOND TO FRONTEND
    // ---------------------------------------------------------
    return NextResponse.json({
      data: liveData,
      source: "live",
    });
  } catch (error) {
    console.error("Travel search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}