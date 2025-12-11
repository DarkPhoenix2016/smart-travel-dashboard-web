import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  
  // Unique index for cache
  uniqueKey: { type: String, index: true, unique: true, },

  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },

  timezone: Number,
  
  weather: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    description: String,
    icon: String,
    windSpeed: Number,
    pressure: Number,
    timezone: Number
  },

  forecast: [mongoose.Schema.Types.Mixed], 
  airQualityForecast: [mongoose.Schema.Types.Mixed],

  airQuality: {
    aqi: Number,
    components: Map
  },


  countryInfo: mongoose.Schema.Types.Mixed, 
  emergencyInfo: mongoose.Schema.Types.Mixed,


  travelAdvisory: {
    level: String,
    score: Number,
    description: String,
    details: mongoose.Schema.Types.Mixed 
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 1 Hour Cache
  },
});

export default mongoose.models.Record || mongoose.model("Record", RecordSchema);