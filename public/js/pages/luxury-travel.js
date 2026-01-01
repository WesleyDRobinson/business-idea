import '/js/components/custom-header.js'

// ============================================================================
// TRIP STATE MANAGEMENT
// ============================================================================

const STORAGE_KEY = 'luxuryTripBuilder_v3'

const createTripState = () => ({
  name: '',
  stops: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
})

let tripState = loadTrip()
let undoStack = []
let toastTimeout = null

// Live data caches
let liveHotelsCache = new Map() // city -> { hotels, timestamp }
let liveRoutesCache = new Map() // from-to -> { routes, timestamp }
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function loadTrip() {
  try {
    // Check for shared trip in URL
    const params = new URLSearchParams(window.location.search)
    const sharedId = params.get('trip')
    if (sharedId) {
      // Will be loaded asynchronously
      return createTripState()
    }

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.destinations && !parsed.stops) {
        return migrateFromV1(parsed)
      }
      return parsed
    }
    return createTripState()
  } catch {
    return createTripState()
  }
}

function migrateFromV1(old) {
  const newState = createTripState()
  newState.name = old.name || ''
  newState.stops = (old.destinations || []).map(d => ({
    id: d.tripId || generateId(),
    destination: {
      name: d.name,
      searchName: d.searchName || d.name,
      description: d.description || '',
      source: d.source || 'Custom',
      isCustom: d.isCustom || false
    },
    hotel: null,
    startDate: d.startDate || '',
    endDate: d.endDate || '',
    notes: ''
  }))
  return newState
}

function saveTrip() {
  tripState.updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tripState))
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchLiveHotels(city) {
  const cacheKey = city.toLowerCase()
  const cached = liveHotelsCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(`/api/hotels?city=${encodeURIComponent(city)}&limit=12`)
    const data = await res.json()

    liveHotelsCache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (e) {
    console.error('Failed to fetch hotels:', e)
    return { hotels: [], error: 'Failed to fetch hotels' }
  }
}

async function fetchLiveRoutes(from, to) {
  const cacheKey = `${from.toLowerCase()}-${to.toLowerCase()}`
  const cached = liveRoutesCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(`/api/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
    const data = await res.json()

    liveRoutesCache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (e) {
    console.error('Failed to fetch routes:', e)
    return { routes: [], error: 'Failed to fetch routes' }
  }
}

async function shareTrip() {
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripState)
    })
    const data = await res.json()

    if (data.id) {
      const shareUrl = `${window.location.origin}${data.url}`
      await navigator.clipboard.writeText(shareUrl)
      return { success: true, url: shareUrl }
    }
    return { success: false, error: data.error }
  } catch (e) {
    console.error('Failed to share trip:', e)
    return { success: false, error: 'Failed to create share link' }
  }
}

async function loadSharedTrip(shareId) {
  try {
    const res = await fetch(`/api/share?id=${encodeURIComponent(shareId)}`)
    const data = await res.json()

    if (data.trip) {
      return data.trip
    }
    return null
  } catch (e) {
    console.error('Failed to load shared trip:', e)
    return null
  }
}

// ============================================================================
// CURATED DATA (fallback suggestions)
// ============================================================================

const curatedDestinations = [
  { name: 'Seville, Spain', searchName: 'Seville Spain', description: 'Top-tier luxury city break with world-class dining and vibrant nightlife.', source: 'Condé Nast 2026' },
  { name: 'Greek Islands', searchName: 'Santorini Greece', description: 'Paros, Sifnos, Santorini, Crete — the Cyclades and beyond.', source: 'Condé Nast 2026' },
  { name: 'Kyoto, Japan', searchName: 'Kyoto Japan', description: 'Ancient temples, traditional ryokans, and exquisite kaiseki cuisine.', source: 'Condé Nast 2026' },
  { name: 'Uluṟu, Australia', searchName: 'Uluru Australia', description: 'New Signature Walk: luxury four-night guided trek with glamping.', source: 'Condé Nast 2026' },
  { name: 'Brussels, Belgium', searchName: 'Brussels Belgium', description: 'Art nouveau architecture, world-renowned chocolate, evolving culinary scene.', source: 'Condé Nast 2026' },
  { name: 'Barbados East Coast', searchName: 'Bathsheba Barbados', description: 'Dramatic Atlantic landscapes and authentic Caribbean culture.', source: 'Condé Nast 2026' },
  { name: 'Queensland, Australia', searchName: 'Cairns Australia', description: 'Great Barrier Reef and new luxury Whitsunday resorts.', source: 'Condé Nast 2025' },
  { name: 'Greenland', searchName: 'Nuuk Greenland', description: 'New direct flights from NYC. Arctic luxury frontier.', source: 'Condé Nast 2025' },
  { name: 'La Paz, Bolivia', searchName: 'La Paz Bolivia', description: 'South America\'s most underrated foodie scene.', source: 'Condé Nast 2025' },
  { name: 'Uganda', searchName: 'Bwindi Uganda', description: 'Gorilla Forest Camp for rare mountain gorilla encounters.', source: 'Condé Nast 2025' },
  { name: 'Provence, France', searchName: 'Provence France', description: 'Lavender fields, Michelin stars, and private island retreats.', source: 'Tablet Hotels' },
  { name: 'Amalfi Coast, Italy', searchName: 'Amalfi Italy', description: 'Cliffside villages, infinity pools, Mediterranean perfection.', source: 'Tablet Hotels' },
]

const curatedHotels = [
  { name: 'The Whitby', location: 'New York, USA', description: 'English hospitality meets Manhattan luxury. Firmdale at its finest.', source: 'Tablet Top-Rated' },
  { name: 'Hotel Chelsea', location: 'New York, USA', description: 'Where Twain and Madonna stayed. Freshly renovated for modern travelers.', source: 'Tablet Top-Rated' },
  { name: 'Witt Istanbul', location: 'Istanbul, Turkey', description: 'Autoban-designed suites with kitchens. Modernist luxury in wood and leather.', source: 'Tablet Top-Rated' },
  { name: 'Ett Hem', location: 'Stockholm, Sweden', description: 'Ilse Crawford\'s masterpiece. The finest Scandinavian boutique hotel.', source: 'Tablet Top-Rated' },
  { name: 'The Shinmonzen', location: 'Kyoto, Japan', description: 'Nine suites by Tadao Ando. Nostalgic and futuristic in equal measure.', source: 'Tablet 2025' },
  { name: 'Azumi Setoda', location: 'Ikuchijima, Japan', description: 'Adrian Zecha\'s first post-Aman property. 140-year-old restored ryokan.', source: 'Tablet 2025' },
  { name: 'Fogo Island Inn', location: 'Newfoundland, Canada', description: 'On stilts above crashing waves. The edge of the earth.', source: 'Tablet 2026' },
  { name: 'Zannier Bendor', location: 'Provence, France', description: '17-acre private island. Opening spring 2026.', source: 'Tablet 2026' },
  { name: 'Lizard Island', location: 'Queensland, Australia', description: 'Direct Great Barrier Reef access from your room.', source: 'Tablet 2026' },
  { name: 'Mandarin Oriental', location: 'Bangkok, Thailand', description: 'Crowned best luxury chain in the world. Top 10 globally.', source: 'Tablet 2026' },
  { name: 'Aman Tokyo', location: 'Tokyo, Japan', description: 'Minimalist perfection. Panoramic city views.', source: 'Tablet Hotels' },
  { name: 'Singita Lodges', location: 'Tanzania / South Africa', description: 'Ultra-luxury safari. Conservation meets indulgence.', source: 'Tablet Hotels' },
]

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

export const showLuxuryTravel = function showLuxuryTravel() {
  const { render, html } = lighterhtml

  function rerender() {
    renderPage()
  }

  // Check for shared trip on load
  async function checkForSharedTrip() {
    const params = new URLSearchParams(window.location.search)
    const sharedId = params.get('trip')

    if (sharedId) {
      showToast('Loading shared trip...', 'info')
      const shared = await loadSharedTrip(sharedId)

      if (shared) {
        tripState = {
          ...createTripState(),
          ...shared,
          stops: shared.stops.map(s => ({ ...s, id: s.id || generateId() }))
        }
        saveTrip()

        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname)

        showToast(`Loaded "${shared.name || 'Shared Trip'}"`, 'success')
        panelExpanded = true
        rerender()
      } else {
        showToast('Could not load shared trip', 'error')
      }
    }
  }

  // ============================================================================
  // TRIP ACTIONS
  // ============================================================================

  function addStop(destination, hotel = null) {
    const stop = {
      id: generateId(),
      destination: {
        name: destination.name,
        searchName: destination.searchName || destination.name.replace(/,/g, ''),
        description: destination.description || '',
        source: destination.source || 'Custom',
        isCustom: destination.isCustom || false
      },
      hotel: hotel ? {
        name: hotel.name,
        location: hotel.location,
        description: hotel.description || '',
        source: hotel.source || 'Custom',
        url: hotel.url || null
      } : null,
      startDate: '',
      endDate: '',
      notes: ''
    }
    tripState.stops.push(stop)
    saveTrip()
    rerender()
    showToast(`Added ${destination.name} to your trip`, 'success')
  }

  function addCustomDestination(name) {
    if (!name.trim()) return
    addStop({
      name: name.trim(),
      searchName: name.trim().replace(/,/g, ''),
      description: '',
      source: 'Custom',
      isCustom: true
    })
  }

  function setHotelForStop(stopId, hotel) {
    const stop = tripState.stops.find(s => s.id === stopId)
    if (!stop) return

    stop.hotel = hotel ? {
      name: hotel.name,
      location: hotel.location || stop.destination.name,
      description: hotel.description || '',
      source: hotel.source || 'Custom',
      url: hotel.url || null
    } : null
    saveTrip()
    rerender()
    showToast(hotel ? `Added ${hotel.name}` : 'Hotel removed', 'success')
  }

  function removeStop(stopId) {
    const idx = tripState.stops.findIndex(s => s.id === stopId)
    if (idx === -1) return

    const removed = tripState.stops.splice(idx, 1)[0]
    undoStack.push({ type: 'stop', item: removed, index: idx })
    saveTrip()
    rerender()
    showToast(`Removed ${removed.destination.name}`, 'undo', () => undoRemove())
  }

  function undoRemove() {
    if (undoStack.length === 0) return
    const last = undoStack.pop()
    tripState.stops.splice(last.index, 0, last.item)
    saveTrip()
    rerender()
    showToast(`Restored ${last.item.destination.name}`, 'success')
  }

  function moveStop(stopId, direction) {
    const idx = tripState.stops.findIndex(s => s.id === stopId)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= tripState.stops.length) return

    const [item] = tripState.stops.splice(idx, 1)
    tripState.stops.splice(newIdx, 0, item)
    saveTrip()
    rerender()
  }

  function updateStopDate(stopId, field, value) {
    const stop = tripState.stops.find(s => s.id === stopId)
    if (stop) {
      stop[field] = value
      saveTrip()
    }
  }

  function updateTripName(name) {
    tripState.name = name
    saveTrip()
  }

  function clearTrip() {
    if (!confirm('Clear your entire trip? This cannot be undone.')) return
    tripState = createTripState()
    saveTrip()
    rerender()
    showToast('Trip cleared', 'success')
  }

  async function handleShare() {
    if (tripState.stops.length === 0) {
      showToast('Add some stops first!', 'info')
      return
    }

    const result = await shareTrip()
    if (result.success) {
      showToast('Share link copied to clipboard!', 'success')
    } else {
      showToast(result.error || 'Failed to share', 'error')
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================

  function showToast(message, type = 'info', onUndo = null) {
    if (toastTimeout) clearTimeout(toastTimeout)

    const existingToast = document.getElementById('trip-toast')
    if (existingToast) existingToast.remove()

    const toast = document.createElement('div')
    toast.id = 'trip-toast'
    toast.className = 'fixed bottom-2 left-2 right-2 mw6 center pa3 br3 shadow-2 flex items-center justify-between'
    toast.style.cssText = 'animation: slideUp 0.3s ease; z-index: 9999;'

    const bgColor = type === 'success' ? 'bg-dark-green near-white' :
                    type === 'undo' ? 'bg-gold near-black' :
                    type === 'error' ? 'bg-dark-red near-white' : 'bg-near-black near-white'
    toast.className += ` ${bgColor}`

    const textSpan = document.createElement('span')
    textSpan.textContent = message
    toast.appendChild(textSpan)

    if (type === 'undo' && onUndo) {
      const undoBtn = document.createElement('button')
      undoBtn.textContent = 'Undo'
      undoBtn.className = 'ml3 bn bg-transparent near-black underline pointer fw6'
      undoBtn.onclick = () => {
        toast.remove()
        onUndo()
      }
      toast.appendChild(undoBtn)
    }

    document.body.appendChild(toast)

    toastTimeout = setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease'
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  // ============================================================================
  // EXPORT FUNCTIONS
  // ============================================================================

  function exportAsText() {
    let text = `# ${tripState.name || 'My Luxury Trip'}\n\n`

    if (tripState.stops.length > 0) {
      tripState.stops.forEach((stop, i) => {
        text += `## ${i + 1}. ${stop.destination.name}\n`
        if (stop.startDate || stop.endDate) {
          text += `**Dates:** ${stop.startDate || '?'} to ${stop.endDate || '?'}\n\n`
        }
        if (stop.destination.description) {
          text += `${stop.destination.description}\n\n`
        }
        if (stop.hotel) {
          text += `**Hotel:** ${stop.hotel.name}${stop.hotel.location ? ` (${stop.hotel.location})` : ''}\n\n`
        }
      })
    }

    if (tripState.stops.length >= 2) {
      text += `## Routes\n\n`
      for (let i = 0; i < tripState.stops.length - 1; i++) {
        const from = tripState.stops[i]
        const to = tripState.stops[i + 1]
        const url = `https://www.rome2rio.com/map/${encodeURIComponent(from.destination.searchName)}/${encodeURIComponent(to.destination.searchName)}`
        text += `- ${from.destination.name} → ${to.destination.name}: [View on Rome2Rio](${url})\n`
      }
    }

    text += `\n---\n*Generated by Luxury Travel Planner*`

    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success')
    }).catch(() => {
      alert('Copy this itinerary:\n\n' + text)
    })
  }

  function printItinerary() {
    const printWindow = window.open('', '_blank')
    let h = `<!DOCTYPE html><html><head><title>${tripState.name || 'My Luxury Trip'}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
        h1 { border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
        .stop { margin: 30px 0; padding: 20px; background: #f8f8f8; border-radius: 8px; border-left: 4px solid #1a472a; }
        .stop h2 { margin: 0 0 5px 0; color: #1a472a; }
        .dates { color: #666; font-size: 14px; margin-bottom: 10px; }
        .hotel { margin-top: 15px; padding: 10px; background: white; border-radius: 4px; }
        .route { margin: 10px 0; padding: 10px; background: #e8f4ea; border-radius: 4px; }
      </style></head><body>
      <h1>${tripState.name || 'My Luxury Trip'}</h1>`

    tripState.stops.forEach((stop, i) => {
      h += `<div class="stop">
        <h2>${i + 1}. ${stop.destination.name}</h2>
        ${stop.startDate || stop.endDate ? `<p class="dates">${stop.startDate || '?'} → ${stop.endDate || '?'}</p>` : ''}
        ${stop.hotel ? `<div class="hotel"><strong>Hotel:</strong> ${stop.hotel.name}</div>` : ''}
      </div>`
    })

    if (tripState.stops.length >= 2) {
      h += `<h2>Routes</h2>`
      for (let i = 0; i < tripState.stops.length - 1; i++) {
        const from = tripState.stops[i], to = tripState.stops[i + 1]
        const url = `https://www.rome2rio.com/map/${encodeURIComponent(from.destination.searchName)}/${encodeURIComponent(to.destination.searchName)}`
        h += `<div class="route">${from.destination.name} → ${to.destination.name}: <a href="${url}">Rome2Rio</a></div>`
      }
    }

    h += `</body></html>`
    printWindow.document.write(h)
    printWindow.document.close()
    printWindow.print()
  }

  // ============================================================================
  // UI STATE
  // ============================================================================

  let panelExpanded = tripState.stops.length > 0
  let activeTab = 'custom'
  let customDestInput = ''
  let customHotelName = ''
  let customHotelLocation = ''
  let hotelAssignStopId = null

  // Live data states
  let liveHotels = []
  let liveHotelsLoading = false
  let liveHotelsError = null
  let liveRoutes = new Map() // routeKey -> { routes, loading, error }
  let expandedRoute = null // which route is expanded

  function togglePanel() {
    panelExpanded = !panelExpanded
    rerender()
  }

  function setTab(tab) {
    activeTab = tab
    // Load live hotels when switching to hotels tab with a destination selected
    if (tab === 'hotels' && hotelAssignStopId) {
      const stop = tripState.stops.find(s => s.id === hotelAssignStopId)
      if (stop) {
        loadLiveHotels(stop.destination.name.split(',')[0].trim())
      }
    }
    rerender()
  }

  function startAssignHotel(stopId) {
    hotelAssignStopId = stopId
    activeTab = 'hotels'
    const stop = tripState.stops.find(s => s.id === stopId)
    if (stop) {
      loadLiveHotels(stop.destination.name.split(',')[0].trim())
    }
    rerender()
  }

  function cancelAssignHotel() {
    hotelAssignStopId = null
    liveHotels = []
    rerender()
  }

  async function loadLiveHotels(city) {
    liveHotelsLoading = true
    liveHotelsError = null
    rerender()

    const result = await fetchLiveHotels(city)

    liveHotelsLoading = false
    if (result.error && result.hotels.length === 0) {
      liveHotelsError = result.error
    } else {
      liveHotels = result.hotels || []
    }
    rerender()
  }

  async function loadRoutePreview(from, to) {
    const key = `${from}-${to}`
    liveRoutes.set(key, { routes: [], loading: true, error: null })
    rerender()

    const result = await fetchLiveRoutes(from, to)

    liveRoutes.set(key, {
      routes: result.routes || [],
      loading: false,
      error: result.error || null,
      url: result.url
    })
    rerender()
  }

  function toggleRouteExpand(from, to) {
    const key = `${from}-${to}`
    if (expandedRoute === key) {
      expandedRoute = null
    } else {
      expandedRoute = key
      if (!liveRoutes.has(key)) {
        loadRoutePreview(from, to)
      }
    }
    rerender()
  }

  // ============================================================================
  // STYLES
  // ============================================================================

  const S = {
    page: 'min-vh-100 animated fadeIn',
    hero: 'pv4 pv5-ns flex items-center justify-center bg-dark-green near-white',
    main: 'bg-near-white near-black pb6',
    section: 'pa3 pa5-ns mw9 center',
    heroTitle: 'f2 f1-ns fw7 tc ma0 ttu tracked',
    heroSub: 'f5 f4-ns fw3 tc mt3 o-80 measure center',
    tabs: 'flex bb b--light-gray mb4',
    tab: 'pa3 pointer bg-transparent bn f6 fw5 gray',
    tabActive: 'pa3 pointer bg-transparent bn f6 fw6 dark-green bb bw2 b--dark-green',
    grid: 'flex flex-wrap nl2 nr2',
    card: 'w-100 w-50-m w-third-l pa2',
    cardInner: 'bg-white br3 pa3 shadow-1 h-100 flex flex-column',
    cardTitle: 'f5 fw6 mb1 dark-green',
    cardMeta: 'f7 gray mb2',
    cardDesc: 'f6 lh-copy gray flex-grow-1',
    btn: 'mt3 pa2 br2 bn pointer dim f7 fw6 ttu tracked',
    btnPrimary: 'bg-dark-green near-white',
    btnSecondary: 'bg-near-white dark-green ba b--dark-green',
    btnSmall: 'pa1 ph2 br2 bn pointer dim f7',
    input: 'input-reset ba b--light-gray br2 pa2 f6 w-100 mb2',
    inputLarge: 'input-reset ba b--light-gray br3 pa3 f5 w-100',
    panel: 'fixed bottom-0 right-0 z-4 w-100 w-auto-ns bg-white shadow-2 br3-ns br--top-ns overflow-hidden',
    panelToggle: 'fixed bottom-1 right-1 z-5 bg-dark-green near-white pa3 br3 shadow-2 pointer flex items-center dim',
    panelHeader: 'bg-dark-green near-white pa3 flex items-center justify-between',
    panelBody: 'pa3 overflow-y-auto',
    stop: 'pa3 mb3 br3 bg-near-white',
    stopHeader: 'flex items-start justify-between mb2',
    stopNum: 'f6 fw6 bg-dark-green near-white br-100 w2 h2 flex items-center justify-center mr2',
    stopActions: 'flex flex-column items-center',
    iconBtn: 'bn bg-transparent pointer dim pa1 f6',
    dateRow: 'flex items-center mt2',
    dateInput: 'input-reset ba b--light-gray br2 pa2 f7',
    hotelCard: 'mt2 pa2 br2 bg-white ba b--light-gray',
    extLink: 'link dark-green underline hover-green',
    footer: 'bg-near-black near-white pa4 tc',
    loading: 'tc pa4 gray',
    routeCard: 'pa2 mb1 br2 bg-lightest-blue dark-blue',
    routeExpanded: 'pa3 mb2 br2 bg-white ba b--light-blue',
  }

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  function DestinationCard(dest) {
    const isInTrip = tripState.stops.some(s => s.destination.name === dest.name)

    return html`
      <div class=${S.card}>
        <div class=${S.cardInner}>
          <h4 class=${S.cardTitle}>${dest.name}</h4>
          <p class=${S.cardMeta}>${dest.source}</p>
          <p class=${S.cardDesc}>${dest.description}</p>
          <button
            class="${S.btn} ${isInTrip ? S.btnSecondary : S.btnPrimary}"
            onclick=${() => !isInTrip && addStop(dest)}
            disabled=${isInTrip}
          >
            ${isInTrip ? '✓ Added' : '+ Add Stop'}
          </button>
        </div>
      </div>
    `
  }

  function HotelCard(hotel, isLive = false) {
    const isAssigning = hotelAssignStopId !== null
    const assignTarget = isAssigning ? tripState.stops.find(s => s.id === hotelAssignStopId) : null

    return html`
      <div class=${S.card}>
        <div class=${S.cardInner}>
          <h4 class=${S.cardTitle}>${hotel.name}</h4>
          <p class=${S.cardMeta}>${hotel.location}${hotel.source ? ` · ${hotel.source}` : ''}${isLive ? ' · Live' : ''}</p>
          <p class=${S.cardDesc}>${hotel.description || ''}</p>
          <div class="flex gap2 mt3">
            ${isAssigning ? html`
              <button class="${S.btn} ${S.btnPrimary}" style="flex:1" onclick=${() => {
                setHotelForStop(hotelAssignStopId, hotel)
                hotelAssignStopId = null
                liveHotels = []
              }}>
                Add to ${assignTarget?.destination.name.split(',')[0]}
              </button>
            ` : html`
              ${hotel.url ? html`
                <a href=${hotel.url} target="_blank" rel="noopener"
                   class="${S.btn} ${S.btnSecondary}" style="flex:1;text-align:center">
                  View on Tablet →
                </a>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `
  }

  function RoutePreview(from, to) {
    const key = `${from}-${to}`
    const routeData = liveRoutes.get(key)
    const isExpanded = expandedRoute === key
    const r2rUrl = `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}`

    return html`
      <div class="mb2">
        <button
          class="db w-100 pa2 br2 bg-lightest-blue dark-blue tl bn pointer hover-bg-light-blue"
          onclick=${() => toggleRouteExpand(from, to)}
        >
          <span class="fw6">${from.split(',')[0]}</span>
          <span class="mh1">→</span>
          <span class="fw6">${to.split(',')[0]}</span>
          <span class="fr">${isExpanded ? '▼' : '▶'}</span>
        </button>

        ${isExpanded ? html`
          <div class=${S.routeExpanded}>
            ${routeData?.loading ? html`
              <div class=${S.loading}>Loading routes...</div>
            ` : routeData?.routes?.length > 0 ? html`
              <div class="mb2">
                ${routeData.routes.slice(0, 4).map(route => html`
                  <div class="flex items-center justify-between pv2 bb b--light-gray">
                    <div>
                      <span class="mr2">${route.emoji || ''}</span>
                      <span class="fw5">${route.name}</span>
                    </div>
                    <div class="f7 gray">
                      ${route.durationText || ''}
                      ${route.price ? html`<span class="ml2 fw6">~$${route.price.amount}</span>` : ''}
                    </div>
                  </div>
                `)}
              </div>
            ` : html`
              <p class="f6 gray">Click below to see route options.</p>
            `}
            <a href=${r2rUrl} target="_blank" rel="noopener"
               class="dib pa2 br2 bg-dark-blue near-white no-underline fw6 dim f7">
              Open in Rome2Rio →
            </a>
          </div>
        ` : ''}
      </div>
    `
  }

  function CustomEntrySection() {
    return html`
      <div class="pa4 br3 bg-white shadow-1 mb4">
        <h3 class="f4 fw6 dark-green mb3">Add Custom Destination</h3>
        <p class="f6 gray mb3">Enter any city, landmark, or region. Routes are generated automatically.</p>
        <div class="flex gap2">
          <input
            type="text"
            class=${S.inputLarge}
            style="flex:1"
            placeholder="e.g. Marrakech, Morocco"
            value=${customDestInput}
            oninput=${(e) => { customDestInput = e.target.value }}
            onkeydown=${(e) => {
              if (e.key === 'Enter' && customDestInput.trim()) {
                addCustomDestination(customDestInput)
                customDestInput = ''
                rerender()
              }
            }}
          />
          <button
            class="${S.btn} ${S.btnPrimary}"
            style="height: auto"
            onclick=${() => {
              if (customDestInput.trim()) {
                addCustomDestination(customDestInput)
                customDestInput = ''
                rerender()
              }
            }}
          >
            + Add
          </button>
        </div>

        <h3 class="f4 fw6 dark-green mb3 mt4">Add Custom Hotel</h3>
        <p class="f6 gray mb3">Add any hotel, or click "+ Add Hotel" on a stop for live Tablet search.</p>
        <div class="flex flex-wrap gap2">
          <input
            type="text"
            class=${S.input}
            style="flex:2;min-width:200px"
            placeholder="Hotel name"
            value=${customHotelName}
            oninput=${(e) => { customHotelName = e.target.value }}
          />
          <input
            type="text"
            class=${S.input}
            style="flex:1;min-width:150px"
            placeholder="City/Location"
            value=${customHotelLocation}
            oninput=${(e) => { customHotelLocation = e.target.value }}
          />
        </div>
        ${tripState.stops.length > 0 ? html`
          <p class="f7 gray mt2 mb2">Assign to stop:</p>
          <div class="flex flex-wrap gap2">
            ${tripState.stops.map((stop, idx) => html`
              <button
                class="${S.btnSmall} ${S.btnSecondary}"
                onclick=${() => {
                  if (customHotelName.trim()) {
                    setHotelForStop(stop.id, {
                      name: customHotelName.trim(),
                      location: customHotelLocation.trim() || stop.destination.name,
                      source: 'Custom'
                    })
                    customHotelName = ''
                    customHotelLocation = ''
                  }
                }}
              >
                ${idx + 1}. ${stop.destination.name.split(',')[0]}
              </button>
            `)}
          </div>
        ` : html`
          <p class="f7 gray mt3">Add a destination first, then assign hotels to it.</p>
        `}
      </div>
    `
  }

  function TripPanel() {
    const stopCount = tripState.stops.length

    if (!panelExpanded) {
      return html`
        <button class=${S.panelToggle} onclick=${togglePanel}>
          <span class="f5 mr2">🧳</span>
          <span class="fw6">Trip${stopCount > 0 ? ` (${stopCount})` : ''}</span>
        </button>
      `
    }

    return html`
      <div class=${S.panel} style="max-height: 85vh; width: 100%; max-width: 440px;">
        <div class=${S.panelHeader}>
          <input
            type="text"
            placeholder="Name your trip..."
            value=${tripState.name}
            oninput=${(e) => updateTripName(e.target.value)}
            class="input-reset bn bg-transparent near-white f5 fw6 w-100"
            style="outline: none;"
          />
          <button onclick=${togglePanel} class="bn bg-transparent near-white pointer f4 ml2">×</button>
        </div>

        <div class=${S.panelBody} style="max-height: 70vh;">
          ${stopCount === 0 ? html`
            <div class="tc pa4 gray">
              <p class="f4 mb2">Start Planning</p>
              <p class="f6">Add destinations from the curated lists or create your own custom stops.</p>
            </div>
          ` : ''}

          ${tripState.stops.map((stop, idx) => html`
            <div class=${S.stop}>
              <div class=${S.stopHeader}>
                <div class="flex items-center">
                  <span class=${S.stopNum}>${idx + 1}</span>
                  <div>
                    <div class="fw6">${stop.destination.name}</div>
                    <span class="f7 gray">${stop.destination.source || 'Custom'}</span>
                  </div>
                </div>
                <div class=${S.stopActions}>
                  <button class=${S.iconBtn} onclick=${() => moveStop(stop.id, -1)} disabled=${idx === 0} style=${idx === 0 ? 'opacity:0.3' : ''}>↑</button>
                  <button class=${S.iconBtn} onclick=${() => moveStop(stop.id, 1)} disabled=${idx === stopCount - 1} style=${idx === stopCount - 1 ? 'opacity:0.3' : ''}>↓</button>
                  <button class="${S.iconBtn} dark-red" onclick=${() => removeStop(stop.id)}>×</button>
                </div>
              </div>

              <div class=${S.dateRow}>
                <input type="date" class=${S.dateInput} value=${stop.startDate} onchange=${(e) => updateStopDate(stop.id, 'startDate', e.target.value)} />
                <span class="mh2 gray">→</span>
                <input type="date" class=${S.dateInput} value=${stop.endDate} onchange=${(e) => updateStopDate(stop.id, 'endDate', e.target.value)} />
              </div>

              ${stop.hotel ? html`
                <div class=${S.hotelCard}>
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="f6 fw6">🏨 ${stop.hotel.name}</div>
                      <div class="f7 gray">${stop.hotel.location}</div>
                    </div>
                    <button class="${S.iconBtn} dark-red f7" onclick=${() => setHotelForStop(stop.id, null)}>×</button>
                  </div>
                </div>
              ` : html`
                <button class="${S.btnSmall} ${S.btnSecondary} mt2" onclick=${() => startAssignHotel(stop.id)}>
                  + Add Hotel (Live Search)
                </button>
              `}
            </div>
          `)}

          ${tripState.stops.length >= 2 ? html`
            <div class="mt3 mb3">
              <h4 class="f6 ttu tracked gray mb2">Routes (click to preview)</h4>
              ${tripState.stops.slice(0, -1).map((stop, idx) => {
                const next = tripState.stops[idx + 1]
                return RoutePreview(stop.destination.searchName, next.destination.searchName)
              })}
            </div>
          ` : ''}

          ${stopCount > 0 ? html`
            <div class="bt b--light-gray pt3 mt3">
              <div class="flex gap2 mb2">
                <button class="${S.btnSmall} bg-dark-green near-white flex-grow-1" onclick=${exportAsText}>📋 Copy</button>
                <button class="${S.btnSmall} bg-navy near-white flex-grow-1" onclick=${printItinerary}>🖨 Print</button>
                <button class="${S.btnSmall} bg-purple near-white flex-grow-1" onclick=${handleShare}>🔗 Share</button>
              </div>
              <button class="${S.btnSmall} bg-near-white dark-red w-100" onclick=${clearTrip}>Clear Trip</button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // ============================================================================
  // MAIN PAGE
  // ============================================================================

  function renderPage() {
    render(document.body, html`
<style>
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .gap2 { gap: 0.5rem; }
  .gap3 { gap: 1rem; }
  .animate-pulse { animation: pulse 1.5s infinite; }
</style>

<custom-header/>
<div class=${S.page}>

<section class=${S.hero}>
  <div class="tc pa4">
    <h1 class=${S.heroTitle}>Luxury Travel Planner</h1>
    <p class=${S.heroSub}>Live hotel search from Tablet Hotels. Route previews from Rome2Rio. Shareable itineraries.</p>
  </div>
</section>

<main class=${S.main}>
<section class=${S.section}>

  <div class=${S.tabs}>
    <button class=${activeTab === 'custom' ? S.tabActive : S.tab} onclick=${() => setTab('custom')}>✨ Custom Entry</button>
    <button class=${activeTab === 'destinations' ? S.tabActive : S.tab} onclick=${() => setTab('destinations')}>Destinations</button>
    <button class=${activeTab === 'hotels' ? S.tabActive : S.tab} onclick=${() => setTab('hotels')}>Hotels</button>
  </div>

  ${hotelAssignStopId && activeTab !== 'hotels' ? html`
    <div class="pa3 mb4 br2 bg-washed-yellow">
      <p class="f6">Selecting hotel for: <strong>${tripState.stops.find(s => s.id === hotelAssignStopId)?.destination.name}</strong></p>
      <button class="${S.btnSmall} ${S.btnSecondary} mt2" onclick=${() => setTab('hotels')}>Browse Hotels →</button>
      <button class="${S.btnSmall} bg-near-white ml2 mt2" onclick=${cancelAssignHotel}>Cancel</button>
    </div>
  ` : ''}

  ${activeTab === 'custom' ? CustomEntrySection() : ''}

  ${activeTab === 'destinations' ? html`
    <div class="mb4">
      <h3 class="f4 fw6 dark-green mb3">Condé Nast Traveler Picks</h3>
      <div class=${S.grid}>
        ${curatedDestinations.map(d => DestinationCard(d))}
      </div>
      <p class="f7 gray i mt3">Source: <a class=${S.extLink} href="https://www.cntraveler.com/" target="_blank">Condé Nast Traveler</a></p>
    </div>
  ` : ''}

  ${activeTab === 'hotels' ? (() => {
    const assigningStop = hotelAssignStopId ? tripState.stops.find(s => s.id === hotelAssignStopId) : null
    const searchCity = assigningStop ? assigningStop.destination.name.split(',')[0].trim() : ''
    const tabletSearchUrl = searchCity
      ? `https://www.tablethotels.com/en/search?query=${encodeURIComponent(searchCity)}`
      : 'https://www.tablethotels.com/'

    const matchingCurated = assigningStop
      ? curatedHotels.filter(h => h.location.toLowerCase().includes(searchCity.toLowerCase()))
      : []
    const otherCurated = assigningStop
      ? curatedHotels.filter(h => !h.location.toLowerCase().includes(searchCity.toLowerCase()))
      : curatedHotels

    return html`
    <div class="mb4">
      ${assigningStop ? html`
        <div class="pa3 mb4 br2 bg-washed-yellow">
          <p class="f5 fw6 mb2">Finding hotels in ${searchCity}</p>
          ${liveHotelsLoading ? html`
            <p class="f6 gray animate-pulse">Searching Tablet Hotels...</p>
          ` : liveHotels.length > 0 ? html`
            <p class="f6 gray mb2">Found ${liveHotels.length} hotels from Tablet</p>
          ` : html`
            <p class="f6 gray mb2">Select from options below or search Tablet directly.</p>
          `}
          <div class="flex gap2 flex-wrap">
            <a href=${tabletSearchUrl} target="_blank" rel="noopener"
               class="dib pa2 ph3 br2 bg-dark-blue near-white no-underline fw6 dim f6">
              Search "${searchCity}" on Tablet →
            </a>
            <button class="${S.btnSmall} bg-near-white" onclick=${cancelAssignHotel}>Cancel</button>
          </div>
        </div>

        ${liveHotels.length > 0 ? html`
          <h3 class="f4 fw6 dark-green mb3">Live Results from Tablet Hotels</h3>
          <div class=${S.grid}>
            ${liveHotels.map(h => HotelCard(h, true))}
          </div>
        ` : ''}

        ${matchingCurated.length > 0 ? html`
          <h3 class="f4 fw6 dark-green mb3 mt4">Curated Hotels in ${searchCity}</h3>
          <div class=${S.grid}>
            ${matchingCurated.map(h => HotelCard(h))}
          </div>
        ` : ''}

        ${otherCurated.length > 0 ? html`
          <h3 class="f4 fw6 gray mb3 mt4">Other Curated Hotels</h3>
          <div class=${S.grid}>
            ${otherCurated.map(h => HotelCard(h))}
          </div>
        ` : ''}
      ` : html`
        <div class="pa4 br3 bg-lightest-blue mb4">
          <h3 class="f4 fw6 dark-blue mb2">Live Hotel Search</h3>
          <p class="f6 gray mb3">Click "+ Add Hotel" on any stop in your trip to search Tablet Hotels for that destination.</p>
          <a href="https://www.tablethotels.com/" target="_blank" rel="noopener"
             class="dib pa3 br2 bg-dark-blue near-white no-underline fw6 dim">
            Browse Tablet Hotels →
          </a>
        </div>

        <h3 class="f4 fw6 dark-green mb3">Curated Collection</h3>
        <div class=${S.grid}>
          ${curatedHotels.map(h => HotelCard(h))}
        </div>
      `}

      <p class="f7 gray i mt3">Source: <a class=${S.extLink} href="https://www.tablethotels.com/" target="_blank">Tablet Hotels</a></p>
    </div>
  `})() : ''}

</section>

<section class="pa3 pa5-ns mw9 center">
  <div class="pa4 br3 bg-white shadow-1">
    <h3 class="f3 fw6 dark-green mb3">Powered by Live Data</h3>
    <div class="flex flex-wrap">
      <div class="w-third-ns w-100 pa3 tc">
        <div class="f2 mb2">🏨</div>
        <h4 class="f5 fw6 mb2">Live Hotel Search</h4>
        <p class="f6 gray">Real-time results from Tablet Hotels for any destination</p>
      </div>
      <div class="w-third-ns w-100 pa3 tc">
        <div class="f2 mb2">🗺️</div>
        <h4 class="f5 fw6 mb2">Route Previews</h4>
        <p class="f6 gray">See transport options and durations from Rome2Rio</p>
      </div>
      <div class="w-third-ns w-100 pa3 tc">
        <div class="f2 mb2">🔗</div>
        <h4 class="f5 fw6 mb2">Shareable Trips</h4>
        <p class="f6 gray">Share your itinerary with a link that never expires</p>
      </div>
    </div>
  </div>
</section>

</main>

<footer class=${S.footer}>
  <p class="f6 o-70">Sources: Condé Nast Traveler · Tablet Hotels · Rome2Rio</p>
  <p class="f6 o-70 mt2"><a href="/" class="link near-white underline">← Back to Home</a></p>
</footer>

</div>

${TripPanel()}
`)
  }

  // Initialize
  renderPage()
  checkForSharedTrip()
}
