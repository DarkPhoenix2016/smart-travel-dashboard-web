import { fetchWithRetry } from "../utils/api-utils";

// Helper to detect the real public IP
export async function getPublicIP() {
  try {
    const response = await fetch('https://api64.ipify.org?format=json');
    if (!response.ok) throw new Error('Failed to fetch IP');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn("Could not detect public IP:", error);
    return null;
  }
}

// Helper to check for Private/Local IPs
function isPrivateIP(ip) {
  return (
    !ip ||
    ip === '::1' ||
    ip === 'localhost' ||
    /^(::f{4}:)?127\./.test(ip) ||
    /^(::f{4}:)?10\./.test(ip) ||
    /^(::f{4}:)?172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^(::f{4}:)?192\.168\./.test(ip)
  );
}

export async function getLocationFromIP(ip) {
  // 1. Handle Localhost
  if (isPrivateIP(ip)) {
    const publicIp = await getPublicIP();
    if (publicIp) {
      ip = publicIp;
    } else {
      console.warn("Could not detect public IP. Using default (Colombo).");
      return {
        city: 'Colombo',
        country: 'Sri Lanka',
        countryCode: 'LK', // Added Default
        latitude: 6.9271,
        longitude: 79.8612,
        timezone: 'Asia/Colombo',
        isp: 'Local Development Network',
      };
    }
  }

  // 2. Fetch from API
  const url = `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${ip}`
  try {
    const data = await fetchWithRetry(url)
    return {
      city: data.city || data.location?.city,
      country: data.country_name || data.location?.country_name,
      countryCode: data.country_code2, // <--- CAPTURED HERE
      latitude: Number.parseFloat(data.latitude),
      longitude: Number.parseFloat(data.longitude),
    }
  } catch (error) {
    console.error("Error getting location from IP:", error)
    return {
      city: 'Colombo',
      country: 'Sri Lanka',
      countryCode: 'LK', // Fallback
      latitude: 6.9271,
      longitude: 79.8612,
      timezone: 'Asia/Colombo',
      isp: 'Fallback (API Error)',
    };
  }
}

export async function getLocationFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHERMAP_API_KEY}`,
    )
    const data = await response.json()

    if (data.length > 0) {
      const countryCode = data[0].country; 
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      const countryName = regionNames.of(countryCode);

      return {
        city: data[0].name,
        country: countryName,
        countryCode: countryCode, // <--- CAPTURED HERE
        latitude,
        longitude,
      }
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error)
  }
  return null
}

// 3. Browser GPS (Client-Side) - No changes needed here
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = "Unknown GPS error";
        switch(error.code) {
          case error.PERMISSION_DENIED: msg = "User denied request for Geolocation."; break;
          case error.POSITION_UNAVAILABLE: msg = "Location information is unavailable."; break;
          case error.TIMEOUT: msg = "The request to get user location timed out."; break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}