import axios from "axios"
import * as cheerio from "cheerio"
import { XMLParser } from "fast-xml-parser"

const US_RSS_URL = "https://travel.state.gov/_res/rss/TAsTWs.xml"

const getUkSlug = (country) => {
  const map = {
    "United States": "usa",
    "United Kingdom": "united-kingdom",
    "South Korea": "south-korea",
    "North Korea": "north-korea",
    "Congo (Democratic Republic)": "democratic-republic-of-congo",
    "Congo": "congo",
    "St. Lucia": "st-lucia",
    "St. Kitts and Nevis": "st-kitts-and-nevis",
    "The Bahamas": "bahamas",
    "Gambia": "the-gambia"
  }
  return map[country] || country.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}

export async function getTravelAdvisory(country) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  })
  
  let result = {
    country: country,
    riskLevel: "Unknown",
    riskLevelDescription: "No data available",
    articleLink: "",
    publishedDate: null,
    articleSummary: "",
    article: "",
    ukData: {
        articleLink: "",
        publishedDate: null,
        articleSummary: "",
        metadata: "",
        alerts: [] // Now stores objects: { type: 'note' | 'risk', content: string }
    }
  }

  // 1. PROCESS US STATE DEPARTMENT DATA
  try {
    const usResponse = await axios.get(US_RSS_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 8000
    })
    
    const usJson = parser.parse(usResponse.data)
    const usItems = usJson.rss.channel.item

    const usItem = usItems.find((item) => {
      const title = typeof item.title === 'string' ? item.title : item.title?.['#text'] || "";
      return title.toLowerCase().includes(country.toLowerCase())
    })

    if (usItem) {
        const titleText = typeof usItem.title === 'string' ? usItem.title : usItem.title['#text'];
        const titleParts = titleText.split(" - ")
        if (titleParts[0]) result.country = titleParts[0].trim();

        const categories = Array.isArray(usItem.category) ? usItem.category : [usItem.category];
        const threatCat = categories.find(c => c['@_domain'] === 'Threat-Level');
        let threatString = threatCat ? (threatCat['#text'] || threatCat) : titleParts[1];

        if (threatString) {
            const threatParts = threatString.split(":")
            if (threatParts.length > 0) result.riskLevel = threatParts[0].trim();
            if (threatParts.length > 1) result.riskLevelDescription = threatParts[1].trim();
        }

        result.articleLink = usItem.guid || usItem.link;
        result.publishedDate = usItem.pubDate;

        const descriptionHtml = usItem.description || "";
        const $ = cheerio.load(descriptionHtml);
        const paragraphs = $('p');
        
        if (paragraphs.length >= 2) {
            result.articleSummary = paragraphs.eq(1).text().trim();
        } else if (paragraphs.length > 0) {
            result.articleSummary = paragraphs.eq(0).text().trim();
        }

        result.article = descriptionHtml;
    }
  } catch (usError) {
    console.error(`US Data Error for ${country}: ${usError.message}`)
  }

  // 2. PROCESS UK GOV DATA
  try {
    const ukSlug = getUkSlug(country)
    const ukFeedUrl = `https://www.gov.uk/foreign-travel-advice/${ukSlug}.atom`
    
    const ukResponse = await axios.get(ukFeedUrl, { 
        timeout: 5000,
        headers: { "User-Agent": "Mozilla/5.0" }
    })
    
    const ukJson = parser.parse(ukResponse.data)
    const entry = ukJson.feed.entry ? (Array.isArray(ukJson.feed.entry) ? ukJson.feed.entry[0] : ukJson.feed.entry) : null;

    if (entry) {
        result.ukData.publishedDate = entry.updated;
        
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const altLink = links.find(l => l['@_rel'] === 'alternate');
        const webLink = altLink ? altLink['@_href'] : `https://www.gov.uk/foreign-travel-advice/${ukSlug}`;
        
        result.ukData.articleLink = webLink;
        result.ukData.articleSummary = `Foreign travel advice ${country}`;

        const scrapeResponse = await axios.get(webLink, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        
        const $ = cheerio.load(scrapeResponse.data);
        const metadataHtml = $('[data-module="metadata"]').html();
        if (metadataHtml) result.ukData.metadata = metadataHtml.trim();

        // Capture Notes (Warning Color)
        $('div[role="note"]').each((i, el) => {
            result.ukData.alerts.push({
                type: 'note',
                content: $(el).html()
            });
        });

        // Capture Call-to-Action (Risk/Danger Color)
        $('.call-to-action, div[role="call-to-action"]').each((i, el) => {
            result.ukData.alerts.push({
                type: 'risk',
                content: $(el).html()
            });
        });
    }

  } catch (ukError) {
    // console.warn(`UK Data Error: ${ukError.message}`)
  }

  return result;
}

// Kept for map compatibility
export async function getAllAdvisories() {
    const parser = new XMLParser();
    try {
        const response = await axios.get(US_RSS_URL, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 8000
        });
        const json = parser.parse(response.data);
        const items = json.rss.channel.item;
        const advisoryMap = {};
        
        items.forEach(item => {
            const title = typeof item.title === 'string' ? item.title : item.title?.['#text'] || "";
            const parts = title.split(' - Level ');
            if (parts.length >= 2) {
                const countryName = parts[0].trim();
                const levelPart = parts[1].split(':')[0]; 
                advisoryMap[countryName] = parseInt(levelPart);
            }
        });
        return advisoryMap;
    } catch (error) {
        console.error("Failed to fetch all advisories:", error.message);
        return {};
    }
}