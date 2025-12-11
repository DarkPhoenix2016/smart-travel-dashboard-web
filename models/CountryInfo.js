import mongoose from "mongoose";

const CurrencySchema = new mongoose.Schema({
  code: String,
  name: String,
  symbol: String,
});

const LanguageSchema = new mongoose.Schema({
  iso639_1: String,
  iso639_2: String,
  name: String,
  nativeName: String,
});

const CountryInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }, // Index for fast lookup
  topLevelDomain: [String],
  alpha2Code: String,
  alpha3Code: String,
  callingCodes: [String],
  capital: String,
  altSpellings: [String],
  subregion: String,
  region: String,
  population: Number,
  latlng: [Number],
  demonym: String,
  area: Number,
  gini: Number,
  timezones: [String],
  borders: [String],
  nativeName: String,
  numericCode: String,
  flags: {
    svg: String,
    png: String,
  },
  currencies: [CurrencySchema],
  languages: [LanguageSchema],
  translations: { type: Map, of: String }, // Flexible object for translations
  flag: String,
  cioc: String,
  independent: Boolean,
  
  // Cache Control Fields
  updatedAt: { type: Date, default: Date.now },
});

// Prevent model recompilation in Next.js
export default mongoose.models.CountryInfo || mongoose.model("CountryInfo", CountryInfoSchema);