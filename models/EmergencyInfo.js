import mongoose from "mongoose";

const EmergencySchema = new mongoose.Schema({
  // Index for fast lookups by name
  countryName: { type: String, required: true, index: true }, 
  isoCode: String,
  
  // Store numbers as simple arrays of strings
  fire: [String],
  ambulance: [String],
  police: [String],
  dispatch: [String], // General numbers like 911 or 112
  
  member_112: Boolean, // Useful for EU countries
  localOnly: Boolean,
  
  // Cache Control
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.EmergencyInfo || mongoose.model("EmergencyInfo", EmergencySchema);