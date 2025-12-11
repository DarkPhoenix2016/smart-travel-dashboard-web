import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// Cache the data in memory so we don't read the CSV on every click
let cachedLocations = null;

async function loadLocations() {
  if (cachedLocations) return cachedLocations;

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'worldcities_iso.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse CSV manually (Lightweight, no extra libraries needed)
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim()); // city_ascii, country, lat, lng
    
    const locations = {};

    // Start from index 1 to skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, but handle potential quotes if needed (simplified for this specific CSV format)
      const parts = line.split(',');
      
      // Map based on your CSV structure: city_ascii,lat,lng,country,iso2
      const city = parts[0];
      const lat = parseFloat(parts[1]);
      const lng = parseFloat(parts[2]);
      const country = parts[3];
      const iso2 = parts[4];


      if (country && city) {
        if (!locations[country]) {
          locations[country] = [];
        }
        locations[country].push({ name: city, lat, lng, iso2});
      }
    }

    // Sort cities alphabetically for better UX
    Object.keys(locations).forEach(country => {
      locations[country].sort((a, b) => a.name.localeCompare(b.name));
    });

    cachedLocations = locations;
    return locations;
  } catch (error) {
    console.error("Error loading CSV:", error);
    return {};
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const countryQuery = searchParams.get('country');

  const allLocations = await loadLocations();

  // Mode 1: Get Cities for a specific Country
  if (countryQuery) {
    const cities = allLocations[countryQuery] || [];
    return NextResponse.json(cities);
  }

  // Mode 2: Get All Countries (Sorted)
  const countries = Object.keys(allLocations).sort();
  return NextResponse.json(countries);
}