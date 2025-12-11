# Smart Travel & Safety Dashboard 🌍✈️

![Project Status](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black)

A comprehensive, real-time travel intelligence platform designed to empower travelers with critical safety, meteorological, and logistical data. By aggregating information from government advisories, weather services, and emergency databases, this dashboard serves as a unified "single source of truth" for international travel planning.

**🚀 Live Demo:** [https://smart-travel-dashboard-web.vercel.app/](https://smart-travel-dashboard-web.vercel.app/)

---

## 📝 Description

**What the project does:**
The Smart Travel & Safety Dashboard aggregates essential travel data—including real-time weather, government safety advisories, air quality indices, and local emergency numbers—into a single, user-friendly interface. It allows users to search for any global destination or auto-detect their current location to instantly view a comprehensive safety report.

**Who it is for:**
This tool is designed for international travelers, digital nomads, and travel planners who need reliable, up-to-date safety and logistical information without navigating multiple disconnected websites.

**Why it exists:**
In an era of global mobility, critical travel data is often fragmented across disparate sources (e.g., separate sites for weather, visas, and political warnings). This project solves that problem by centralizing this information, reducing cognitive load, and enhancing situational awareness for safer travel.

## 📚 Table of Contents
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)

## ✨ Features

* **Real-time Data Aggregation:** Fetches live data for weather, air quality, currency rates, and safety advisories simultaneously.
* **Auto-Location Detection:** Automatically detects the user's city and country via IP geolocation or browser GPS.
* **Global Safety Map:** Interactive map visualization showing safety levels and location context.
* **Emergency Infrastructure:** Instantly provides local police, ambulance, and fire department contact numbers for the selected destination.
* **Advisory "Risk Score":** Displays a normalized safety score (0-5) and official government warning text.
* **User Accounts & Favorites:** Secure Google OAuth login allows users to save favorite destinations and view search history.
* **Smart Caching:** Implements a "Stale-While-Revalidate" caching strategy using MongoDB to optimize performance and minimize API usage.

## 💻 Technologies Used

**Frontend:**
* **Framework:** Next.js 14+ (App Router)
* **UI Library:** React.js
* **Styling:** Tailwind CSS, Radix UI (via Shadcn/ui)
* **Icons:** Lucide React

**Backend:**
* **Runtime:** Node.js (Serverless Functions)
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** NextAuth.js (Google OAuth 2.0)
* **HTTP Client:** Axios / Fetch API

**APIs & Services:**
* OpenWeatherMap (Weather & AQI)
* EmergencyNumberAPI (Safety infrastructure)
* IPGeolocation.io (Location services)
* Open Exchange Rates (Currency conversion)
* RestCountries (Metadata)

## 📂 Project Structure

```text
├── app
│   ├── api
│   │   ├── auth            # NextAuth.js authentication endpoints
│   │   ├── country         # Country metadata API
│   │   ├── currency        # Currency exchange rate API
│   │   ├── emergency       # Emergency number API
│   │   ├── favorites       # User favorites management API
│   │   ├── geolocation     # IP-based location detection API
│   │   ├── health          # System health check
│   │   ├── locations       # Autocomplete search API
│   │   └── travel          # Main travel data aggregation (search, records)
│   ├── context             # Global React Context providers (Loader)
│   ├── favorites           # Favorites page frontend
│   ├── login               # Login page
│   ├── profile             # User profile page
│   ├── globals.css         # Global styles
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Main Dashboard (Home)
├── components              # Reusable UI Components
│   ├── ui                  # Shadcn/Radix UI primitives (buttons, cards, inputs)
│   ├── global-safety-map   # Interactive safety map component
│   ├── weather-card        # Weather visualization
│   └── ... (various data cards)
├── lib                     # Core Logic & Utilities
│   ├── services            # Backend services (Weather, Advisory, Emergency)
│   ├── utils               # Helper functions (Country mapping, formatters)
│   ├── auth.js             # Auth configuration
│   └── db.js               # MongoDB connection handler
├── models                  # Mongoose Database Schemas
│   ├── CountryInfo.js
│   ├── CurrencyRate.js
│   ├── EmergencyInfo.js
│   ├── TravelRecord.js
│   └── User.js
└── public                  # Static Assets
    ├── icons               # Weather and UI icons
    └── art                 # Illustration assets
````

## 🚀 Installation

Follow these steps to set up the project locally:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/DarkPhoenix2016/smart-travel-dashboard-web.git](https://github.com/DarkPhoenix2016/smart-travel-dashboard-web.git)
    cd smart-travel-dashboard-web
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory (see [Environment Variables](https://www.google.com/search?q=%23-environment-variables) below).

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

## 🔑 Environment Variables

Create a `.env.local` file in the root of your project and add the following keys. You will need API keys from the respective providers.

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_openssl_secret
GOOGLE_CLIENT_ID=your_google_cloud_client_id
GOOGLE_CLIENT_SECRET=your_google_cloud_client_secret

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# External APIs
OPENWEATHERMAP_API_KEY=your_openweather_api_key
IPGEOLOCATION_API_KEY=your_ipgeolocation_api_key
```

## 📖 Usage

1.  **Search:** Enter a city name (e.g., "Colombo") in the search bar or click "Auto-Detect Location" to see data for your current area.
2.  **Login:** Click the "Sign In" button to authenticate via Google.
3.  **Favorites:** Once logged in, click the "Heart" icon on any city dashboard to save it to your profile for quick access.
4.  **History:** View your recent searches in the profile section.

## 📡 API Documentation

The backend exposes several RESTful endpoints rooted at `/api`.

**Core Endpoints:**

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/travel/search` | Main aggregator. Accepts `{lat, lon, countryCode}` and returns a full report. |
| `GET` | `/api/travel/records` | Retrieves the search history for the logged-in user. |
| `GET` | `/api/favorites` | Fetches the user's saved locations. |
| `POST` | `/api/favorites` | Adds a new location to the user's bookmarks. |

**Utility Endpoints:**

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/currency` | Returns current exchange rates (Cached). |
| `GET` | `/api/emergency` | Returns emergency numbers for a specific country code (e.g., `?code=LK`). |
| `GET` | `/api/geolocation` | Resolves the user's IP address to a physical location. |

## 🤝 Contributing

Contributions are welcome\! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 🗺️ Roadmap (Optional)

  * [ ] **Personalized Advisories:** Allow users to set a "Home Country" to fetch specific diplomatic travel advice.
  * [ ] **Proactive Alerts:** Implement email/push notifications when safety levels change for saved locations.
  * [ ] **Offline Mode:** Convert the application to a PWA for offline access to emergency numbers.

## 📄 License

This project is licensed under the MIT License.

## ✍️ Authors / Maintainers

  * **DarkPhoenix2016** - *Initial Work & Development* - [GitHub Profile](https://www.google.com/search?q=https://github.com/DarkPhoenix2016)

-----

*Built with ❤️ in Sri Lanka*

```