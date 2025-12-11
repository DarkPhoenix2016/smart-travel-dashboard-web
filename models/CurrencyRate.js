import mongoose from "mongoose";

const CurrencyRateSchema = new mongoose.Schema({
  base: { type: String, default: "USD" },
  rates: { type: Map, of: Number }, // Flexible map for all currency pairs
  lastUpdate: { type: Date },       // API's last update time
  nextUpdate: { type: Date },       // API's next update time
  
  // Cache Control: We store one record per "hour" block to prevent spamming
  createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL 24h
});

export default mongoose.models.CurrencyRate || mongoose.model("CurrencyRate", CurrencyRateSchema);