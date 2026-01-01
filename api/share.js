/**
 * Trip Sharing API
 *
 * POST /api/share - Create a shareable trip
 * GET /api/share?id=xxx - Retrieve a shared trip
 *
 * Uses URL-safe base64 encoding for client-side sharing (no database needed)
 * Trips are encoded in the URL itself, making them permanent and free
 */

import { createHash } from 'crypto';

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

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

// Compress and encode trip data for URL sharing
function encodeTrip(trip) {
  try {
    // Minify the trip data
    const minified = {
      n: trip.name || '',
      s: (trip.stops || []).map(stop => ({
        d: {
          n: stop.destination?.name || '',
          s: stop.destination?.searchName || ''
        },
        h: stop.hotel ? {
          n: stop.hotel.name,
          l: stop.hotel.location
        } : null,
        sd: stop.startDate || '',
        ed: stop.endDate || ''
      }))
    };

    const json = JSON.stringify(minified);

    // Base64 encode (URL-safe)
    const encoded = Buffer.from(json, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Create a short hash for verification
    const hash = createHash('md5').update(json).digest('hex').slice(0, 6);

    return `${hash}.${encoded}`;
  } catch (e) {
    console.error('Encode error:', e);
    return null;
  }
}

// Decode trip data from URL
function decodeTrip(encoded) {
  try {
    // Split hash and data
    const parts = encoded.split('.');
    if (parts.length !== 2) {
      throw new Error('Invalid format');
    }

    const [hash, data] = parts;

    // Restore base64 padding and decode
    let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    const json = Buffer.from(base64, 'base64').toString('utf-8');

    // Verify hash
    const expectedHash = createHash('md5').update(json).digest('hex').slice(0, 6);
    if (hash !== expectedHash) {
      throw new Error('Hash mismatch');
    }

    const minified = JSON.parse(json);

    // Expand back to full format
    const trip = {
      name: minified.n || '',
      stops: (minified.s || []).map((s, i) => ({
        id: `shared-${i}`,
        destination: {
          name: s.d?.n || '',
          searchName: s.d?.s || s.d?.n || '',
          description: '',
          source: 'Shared Trip',
          isCustom: true
        },
        hotel: s.h ? {
          name: s.h.n,
          location: s.h.l,
          description: '',
          source: 'Shared Trip'
        } : null,
        startDate: s.sd || '',
        endDate: s.ed || ''
      })),
      sharedAt: Date.now()
    };

    return trip;
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
}

// Validate trip structure
function validateTrip(trip) {
  if (!trip || typeof trip !== 'object') return false;
  if (!Array.isArray(trip.stops)) return false;
  if (trip.stops.length > 50) return false; // Reasonable limit

  for (const stop of trip.stops) {
    if (!stop.destination?.name) return false;
    if (stop.destination.name.length > 200) return false;
  }

  return true;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // GET - Retrieve a shared trip
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Limit ID length to prevent DoS
    if (id.length > 10000) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = decodeTrip(id);

    if (!trip) {
      return res.status(400).json({ error: 'Invalid or corrupted trip link' });
    }

    return res.status(200).json({
      trip,
      shared: true
    });
  }

  // POST - Create a shareable trip
  if (req.method === 'POST') {
    let trip;

    try {
      trip = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    if (!validateTrip(trip)) {
      return res.status(400).json({ error: 'Invalid trip structure' });
    }

    const shareId = encodeTrip(trip);

    if (!shareId) {
      return res.status(500).json({ error: 'Failed to encode trip' });
    }

    // Check encoded length isn't too long for URLs
    if (shareId.length > 8000) {
      return res.status(400).json({
        error: 'Trip is too large to share via URL. Try removing some stops.'
      });
    }

    return res.status(200).json({
      id: shareId,
      url: `/luxury-travel?trip=${shareId}`,
      expiresAt: null // URL-encoded trips never expire
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
