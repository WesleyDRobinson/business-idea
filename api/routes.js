/**
 * Route Search API - Fetches travel routes from Rome2Rio
 *
 * GET /api/routes?from=Paris&to=Rome
 *
 * Returns route options with:
 * - Transport modes (flight, train, bus, ferry, drive)
 * - Duration estimates
 * - Price estimates (when available)
 * - Direct booking links
 */

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 20;

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
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 100);
}

// Parse Rome2Rio search results
function parseRome2RioResults(html, from, to) {
  const routes = [];

  // Look for route data in script tags (Rome2Rio uses client-side rendering)
  const dataPattern = /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/;
  const match = html.match(dataPattern);

  if (match) {
    try {
      const data = JSON.parse(match[1]);

      // Navigate to route data
      const searchData = data?.search?.searchResponse;
      if (searchData?.routes) {
        for (const route of searchData.routes.slice(0, 6)) {
          const mode = route.name || 'Unknown';
          const segments = route.segments || [];

          let totalDuration = 0;
          let totalPrice = null;
          const modes = new Set();

          for (const seg of segments) {
            if (seg.duration) totalDuration += seg.duration;
            if (seg.indicativePrice?.price && !totalPrice) {
              totalPrice = {
                amount: seg.indicativePrice.price,
                currency: seg.indicativePrice.currency || 'USD'
              };
            }
            if (seg.vehicle) modes.add(seg.vehicle.kind);
          }

          routes.push({
            name: mode,
            modes: Array.from(modes),
            duration: totalDuration,
            durationText: formatDuration(totalDuration),
            price: totalPrice,
            segments: segments.length
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse Rome2Rio data:', e);
    }
  }

  // Fallback: extract basic route cards from HTML
  if (routes.length === 0) {
    const routePattern = /<div[^>]*class="[^"]*route-option[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    const namePattern = /<span[^>]*class="[^"]*mode[^"]*"[^>]*>([^<]+)<\/span>/i;
    const durationPattern = /(\d+)\s*h(?:r|our)?s?\s*(?:(\d+)\s*m(?:in)?)?/i;
    const pricePattern = /(?:\$|€|£)(\d+)/;

    let routeMatch;
    while ((routeMatch = routePattern.exec(html)) !== null && routes.length < 6) {
      const card = routeMatch[1];
      const name = (card.match(namePattern) || [])[1] || 'Route option';
      const durationMatch = card.match(durationPattern);
      const priceMatch = card.match(pricePattern);

      let duration = 0;
      if (durationMatch) {
        duration = (parseInt(durationMatch[1]) || 0) * 60 + (parseInt(durationMatch[2]) || 0);
      }

      routes.push({
        name: name.trim(),
        modes: inferModes(name),
        duration,
        durationText: duration ? formatDuration(duration) : 'Duration varies',
        price: priceMatch ? { amount: parseInt(priceMatch[1]), currency: 'USD' } : null,
        segments: 1
      });
    }
  }

  // If still no routes, provide estimated common options
  if (routes.length === 0) {
    routes.push(
      { name: 'Fly', modes: ['plane'], duration: 0, durationText: 'Check Rome2Rio', price: null, segments: 1 },
      { name: 'Train', modes: ['train'], duration: 0, durationText: 'Check Rome2Rio', price: null, segments: 1 },
      { name: 'Drive', modes: ['car'], duration: 0, durationText: 'Check Rome2Rio', price: null, segments: 1 }
    );
  }

  return routes;
}

function inferModes(name) {
  const lower = name.toLowerCase();
  const modes = [];
  if (lower.includes('fly') || lower.includes('flight') || lower.includes('plane')) modes.push('plane');
  if (lower.includes('train') || lower.includes('rail')) modes.push('train');
  if (lower.includes('bus') || lower.includes('coach')) modes.push('bus');
  if (lower.includes('drive') || lower.includes('car')) modes.push('car');
  if (lower.includes('ferry') || lower.includes('boat')) modes.push('ferry');
  if (modes.length === 0) modes.push('mixed');
  return modes;
}

function formatDuration(minutes) {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Mode emoji mapping
function getModeEmoji(mode) {
  const emojis = {
    plane: '✈️',
    train: '🚂',
    bus: '🚌',
    car: '🚗',
    ferry: '⛴️',
    walk: '🚶',
    mixed: '🔀'
  };
  return emojis[mode] || '🚀';
}

export default async function handler(req, res) {
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
    const from = sanitizeInput(req.query.from);
    const to = sanitizeInput(req.query.to);

    if (!from || !to) {
      return res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
    }

    const rome2rioUrl = `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;

    // Fetch Rome2Rio page
    const response = await fetch(rome2rioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LuxuryTravelPlanner/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Rome2Rio returned ${response.status}`);
    }

    const html = await response.text();
    const routes = parseRome2RioResults(html, from, to);

    // Add emojis to route names
    for (const route of routes) {
      route.emoji = route.modes.map(m => getModeEmoji(m)).join(' ');
    }

    return res.status(200).json({
      from,
      to,
      routes,
      url: rome2rioUrl,
      cached: false
    });

  } catch (error) {
    console.error('Route search error:', error);

    const from = req.query.from || '';
    const to = req.query.to || '';

    // Return fallback with direct link
    return res.status(200).json({
      from,
      to,
      routes: [
        { name: 'Fly', emoji: '✈️', modes: ['plane'], duration: 0, durationText: 'Check Rome2Rio', price: null },
        { name: 'Train', emoji: '🚂', modes: ['train'], duration: 0, durationText: 'Check Rome2Rio', price: null },
        { name: 'Drive', emoji: '🚗', modes: ['car'], duration: 0, durationText: 'Check Rome2Rio', price: null }
      ],
      url: `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
      error: 'Unable to fetch live routes. Click to view on Rome2Rio.',
      cached: false
    });
  }
}
