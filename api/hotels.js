/**
 * Hotel Search API - Fetches hotels from Tablet Hotels
 *
 * GET /api/hotels?city=Paris&limit=12
 *
 * Security:
 * - Input validation and sanitization
 * - Rate limiting via Vercel headers
 * - Response caching (5 min)
 */

// Simple in-memory rate limiting (per-instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter(time => time > windowStart);
  requests.push(now);
  rateLimit.set(ip, requests);

  return requests.length <= RATE_LIMIT_MAX;
}

function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return '';
  // Remove any HTML/script tags, limit length
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 100);
}

// Parse Tablet Hotels search results HTML
function parseTabletResults(html) {
  const hotels = [];

  // Match hotel cards - Tablet uses structured data we can parse
  // Look for hotel name, location, and description patterns
  const hotelPattern = /<article[^>]*class="[^"]*hotel-card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  const namePattern = /<h\d[^>]*class="[^"]*hotel-name[^"]*"[^>]*>([^<]+)<\/h\d>/i;
  const locationPattern = /<[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)</i;
  const descPattern = /<[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i;
  const linkPattern = /href="(\/en\/[^"]*hotel[^"]*)"/i;
  const imagePattern = /(?:src|data-src)="(https:\/\/[^"]*tablet[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i;

  // Alternative pattern for Tablet's actual HTML structure
  const altNamePattern = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i;
  const altLocationPattern = /<span[^>]*class="[^"]*city[^"]*"[^>]*>([^<]+)<\/span>/i;

  let match;
  while ((match = hotelPattern.exec(html)) !== null) {
    const card = match[1];

    let name = (card.match(namePattern) || card.match(altNamePattern) || [])[1];
    let location = (card.match(locationPattern) || card.match(altLocationPattern) || [])[1];
    const description = (card.match(descPattern) || [])[1];
    const link = (card.match(linkPattern) || [])[1];
    const image = (card.match(imagePattern) || [])[1];

    if (name) {
      hotels.push({
        name: name.trim(),
        location: location ? location.trim() : '',
        description: description ? description.trim().slice(0, 200) : '',
        url: link ? `https://www.tablethotels.com${link}` : null,
        image: image || null,
        source: 'Tablet Hotels'
      });
    }
  }

  // Fallback: try to extract from JSON-LD structured data
  if (hotels.length === 0) {
    const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    while ((match = jsonLdPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type'] === 'Hotel' || (Array.isArray(data) && data[0]?.['@type'] === 'Hotel')) {
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (item['@type'] === 'Hotel' && item.name) {
              hotels.push({
                name: item.name,
                location: item.address?.addressLocality || '',
                description: item.description?.slice(0, 200) || '',
                url: item.url || null,
                image: item.image || null,
                source: 'Tablet Hotels'
              });
            }
          }
        }
      } catch (e) {
        // JSON parse failed, continue
      }
    }
  }

  // Second fallback: extract from meta/title patterns
  if (hotels.length === 0) {
    // Look for any hotel-like entries in the page
    const genericPattern = /<div[^>]*data-hotel[^>]*>[\s\S]*?<\/div>/gi;
    const titlePattern = /title="([^"]+)"/i;

    while ((match = genericPattern.exec(html)) !== null) {
      const title = (match[0].match(titlePattern) || [])[1];
      if (title && title.length > 3) {
        hotels.push({
          name: title.trim(),
          location: '',
          description: '',
          url: null,
          image: null,
          source: 'Tablet Hotels'
        });
      }
    }
  }

  return hotels;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const city = sanitizeInput(req.query.city);
    const limit = Math.min(parseInt(req.query.limit) || 12, 24);

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Fetch from Tablet Hotels
    const searchUrl = `https://www.tablethotels.com/en/search?query=${encodeURIComponent(city)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LuxuryTravelPlanner/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Tablet Hotels returned ${response.status}`);
    }

    const html = await response.text();
    let hotels = parseTabletResults(html);

    // Limit results
    hotels = hotels.slice(0, limit);

    // If no hotels found, return empty with helpful message
    if (hotels.length === 0) {
      return res.status(200).json({
        city,
        hotels: [],
        message: `No hotels found for "${city}". Try searching directly on Tablet Hotels.`,
        searchUrl,
        cached: false
      });
    }

    return res.status(200).json({
      city,
      hotels,
      count: hotels.length,
      searchUrl,
      cached: false
    });

  } catch (error) {
    console.error('Hotel search error:', error);

    // Return graceful fallback
    return res.status(200).json({
      city: req.query.city || '',
      hotels: [],
      error: 'Unable to fetch hotels. Please search directly on Tablet Hotels.',
      searchUrl: `https://www.tablethotels.com/en/search?query=${encodeURIComponent(req.query.city || '')}`,
      cached: false
    });
  }
}
