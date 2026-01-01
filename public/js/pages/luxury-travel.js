import '/js/components/custom-header.js'

// ============================================================================
// TRIP STATE MANAGEMENT
// ============================================================================

const STORAGE_KEY = 'luxuryTripBuilder'

const createTripState = () => ({
  name: '',
  destinations: [],
  hotels: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
})

let tripState = loadTrip()
let undoStack = []
let toastTimeout = null

function loadTrip() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : createTripState()
  } catch {
    return createTripState()
  }
}

function saveTrip() {
  tripState.updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tripState))
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// DATA: DESTINATIONS & HOTELS
// ============================================================================

const destinations2026 = [
  { id: 'seville-spain', name: 'Seville, Spain', region: 'Europe', description: 'Energy "squarely in the kitchens and bars" — edging into Spain\'s top tier of luxury city breaks with world-class dining and vibrant nightlife.', source: 'Condé Nast Traveler', searchName: 'Seville Spain' },
  { id: 'boston-usa', name: 'Boston, USA', region: 'North America', description: 'America\'s 250th anniversary shines a spotlight on this historic capital, with 2026 Sail Boston and FIFA World Cup events.', source: 'Condé Nast Traveler', searchName: 'Boston Massachusetts' },
  { id: 'greek-islands', name: 'Greek Islands', region: 'Europe', description: '15 best islands including Paros, Sifnos, Santorini, and Crete — spanning the Cyclades, Dodecanese, and North Aegean.', source: 'Condé Nast Traveler', searchName: 'Santorini Greece' },
  { id: 'uluru-australia', name: 'Uluṟu-Kata Tjuṯa, Australia', region: 'Oceania', description: 'New Signature Walk launching April 2026: a luxury four-night guided trek spanning 33.5 miles with glamping camps and a new ecolodge.', source: 'Condé Nast Traveler', searchName: 'Uluru Australia' },
  { id: 'brussels-belgium', name: 'Brussels, Belgium', region: 'Europe', description: 'A rising star for 2026 with its blend of art nouveau architecture, world-renowned chocolate, and evolving culinary scene.', source: 'Condé Nast Traveler', searchName: 'Brussels Belgium' },
  { id: 'barbados-east', name: 'East Coast of Barbados', region: 'Caribbean', description: 'The less-traveled Atlantic coast offers dramatic landscapes, local culture, and a more authentic Caribbean experience.', source: 'Condé Nast Traveler', searchName: 'Bathsheba Barbados' },
]

const destinations2025 = [
  { id: 'queensland-australia', name: 'Queensland, Australia', region: 'Oceania', description: 'Great Barrier Reef, thriving art scene in Cairns, the new Wangetti Trail, and new luxury resorts on the Whitsunday Islands.', source: 'Condé Nast Traveler', searchName: 'Cairns Australia' },
  { id: 'greenland', name: 'Greenland', region: 'Arctic', description: 'New international airports opening with direct flights from Copenhagen and New York to Nuuk via United Airlines.', source: 'Condé Nast Traveler', searchName: 'Nuuk Greenland' },
  { id: 'la-paz-bolivia', name: 'La Paz, Bolivia', region: 'South America', description: '"South America\'s most underrated foodie scene right now" — forging a reputation as a culinary hotspot.', source: 'Condé Nast Traveler', searchName: 'La Paz Bolivia' },
  { id: 'uganda', name: 'Uganda', region: 'Africa', description: 'New luxury lodges in famous national parks, including Gorilla Forest Camp for seeing rare mountain gorillas.', source: 'Condé Nast Traveler', searchName: 'Bwindi Uganda' },
  { id: 'sussex-uk', name: 'Sussex, UK', region: 'Europe', description: 'New boutique hotels, creative art scene, and the new King Charles III England Coast Path.', source: 'Condé Nast Traveler', searchName: 'Brighton UK' },
  { id: 'nicaragua-emerald', name: 'Nicaragua\'s Emerald Coast', region: 'Central America', description: 'Laid-back vibes and boutique hotels in this renowned surf destination with unspoiled Pacific coastline.', source: 'Condé Nast Traveler', searchName: 'San Juan del Sur Nicaragua' },
]

const hotelsTopRated = [
  { id: 'whitby-nyc', name: 'The Whitby', location: 'New York, USA', description: 'Brings the warmth and coziness of English hospitality to a neighborhood rich with American-style luxury. Firmdale competes with anyone in the world on comfort.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/en/the-whitby-hotel' },
  { id: 'chelsea-nyc', name: 'Hotel Chelsea', location: 'New York, USA', description: 'Where every artist of significance lived, stayed, or hung out — from Mark Twain to Madonna. Freshly renovated for 21st-century boutique-hotel travelers.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/en/hotel-chelsea' },
  { id: 'witt-istanbul', name: 'Witt Istanbul', location: 'Istanbul, Turkey', description: 'Designed by Autoban with modernist-inspired lush interiors, space-age lines in rich textures of wood and leather. Each suite includes living rooms and kitchens.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/en/witt-istanbul-suites' },
  { id: 'ett-hem-stockholm', name: 'Ett Hem', location: 'Stockholm, Sweden', description: 'Designed by Ilse Crawford — probably the finest example of current Scandinavian boutique hotel design: warm, luxe, eclectic coziness.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/en/ett-hem' },
]

const hotelsNew2025 = [
  { id: 'shinmonzen-kyoto', name: 'The Shinmonzen', location: 'Kyoto, Japan', description: 'Nine-suite boutique hotel designed by Tadao Ando — arguably Japan\'s most eminent architect. A vision at once nostalgic and futuristic.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'azumi-setoda', name: 'Azumi Setoda', location: 'Ikuchijima, Japan', description: 'First property from Adrian Zecha, founder of Aman Resorts. 140-year-old estate restored into a boutique ryokan on remote Ikuchijima island.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'chalet-sofija', name: 'Chalet Sofija', location: 'Alps', description: 'Just five luxurious suites with equal emphasis on its gourmet restaurant. Intimate Alpine luxury at its finest.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'lilloy-lindenberg', name: 'Lilløy Lindenberg', location: 'Norway', description: 'A wild, rocky private island hotel in the North Sea — beautifully restored farmhouse in "antique Scandinavian folk style."', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
]

const hotels2026 = [
  { id: 'zannier-bendor', name: 'Zannier Bendor', location: 'Provence, France', description: 'A 17-acre private island retreat owned by the family behind Pernod Ricard. Opening spring 2026 with restaurants, diving, and multiple bars.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'mandarin-bangkok', name: 'Mandarin Oriental', location: 'Bangkok, Thailand', description: 'Recently crowned the best luxury chain in the world, making it into the top 10 hotels in the World\'s 50 Best ranking.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'fogo-island', name: 'Fogo Island Inn', location: 'Newfoundland, Canada', description: 'Propped up on stilts above crashing waves, offering "a feeling that you\'re at the very edge of the earth."', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
  { id: 'lizard-island', name: 'Lizard Island', location: 'Queensland, Australia', description: 'Explore the Great Barrier Reef with rooms boasting immediate access to the waters and marine life.', source: 'Tablet Hotels', url: 'https://www.tablethotels.com/' },
]

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

export const showLuxuryTravel = function showLuxuryTravel() {
  const { render, html } = lighterhtml

  // Re-render the entire page
  function rerender() {
    renderPage()
  }

  // ============================================================================
  // TRIP ACTIONS
  // ============================================================================

  function addDestination(dest) {
    const existing = tripState.destinations.find(d => d.id === dest.id)
    if (existing) {
      showToast(`${dest.name} is already in your trip`)
      return
    }

    const tripDest = {
      ...dest,
      tripId: generateId(),
      startDate: '',
      endDate: '',
      notes: ''
    }
    tripState.destinations.push(tripDest)
    saveTrip()
    rerender()
    showToast(`Added ${dest.name} to your trip`, 'success')
  }

  function addHotel(hotel) {
    const existing = tripState.hotels.find(h => h.id === hotel.id)
    if (existing) {
      showToast(`${hotel.name} is already in your trip`)
      return
    }

    const tripHotel = {
      ...hotel,
      tripId: generateId(),
      checkIn: '',
      checkOut: '',
      notes: ''
    }
    tripState.hotels.push(tripHotel)
    saveTrip()
    rerender()
    showToast(`Added ${hotel.name} to your trip`, 'success')
  }

  function removeDestination(tripId) {
    const idx = tripState.destinations.findIndex(d => d.tripId === tripId)
    if (idx === -1) return

    const removed = tripState.destinations.splice(idx, 1)[0]
    undoStack.push({ type: 'destination', item: removed, index: idx })
    saveTrip()
    rerender()
    showToast(`Removed ${removed.name}`, 'undo', () => undoRemove())
  }

  function removeHotel(tripId) {
    const idx = tripState.hotels.findIndex(h => h.tripId === tripId)
    if (idx === -1) return

    const removed = tripState.hotels.splice(idx, 1)[0]
    undoStack.push({ type: 'hotel', item: removed, index: idx })
    saveTrip()
    rerender()
    showToast(`Removed ${removed.name}`, 'undo', () => undoRemove())
  }

  function undoRemove() {
    if (undoStack.length === 0) return
    const last = undoStack.pop()
    if (last.type === 'destination') {
      tripState.destinations.splice(last.index, 0, last.item)
    } else {
      tripState.hotels.splice(last.index, 0, last.item)
    }
    saveTrip()
    rerender()
    showToast(`Restored ${last.item.name}`, 'success')
  }

  function moveDestination(tripId, direction) {
    const idx = tripState.destinations.findIndex(d => d.tripId === tripId)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= tripState.destinations.length) return

    const [item] = tripState.destinations.splice(idx, 1)
    tripState.destinations.splice(newIdx, 0, item)
    saveTrip()
    rerender()
  }

  function updateDestinationDate(tripId, field, value) {
    const dest = tripState.destinations.find(d => d.tripId === tripId)
    if (dest) {
      dest[field] = value
      saveTrip()
    }
  }

  function updateHotelDate(tripId, field, value) {
    const hotel = tripState.hotels.find(h => h.tripId === tripId)
    if (hotel) {
      hotel[field] = value
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

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================

  function showToast(message, type = 'info', onUndo = null) {
    if (toastTimeout) clearTimeout(toastTimeout)

    const existingToast = document.getElementById('trip-toast')
    if (existingToast) existingToast.remove()

    const toast = document.createElement('div')
    toast.id = 'trip-toast'
    toast.className = 'fixed bottom-2 left-2 right-2 mw6 center pa3 br3 shadow-2 flex items-center justify-between z-999'
    toast.style.cssText = 'animation: slideUp 0.3s ease; z-index: 9999;'

    const bgColor = type === 'success' ? 'bg-dark-green near-white' :
                    type === 'undo' ? 'bg-gold near-black' : 'bg-near-black near-white'
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

    if (tripState.destinations.length > 0) {
      text += `## Destinations\n\n`
      tripState.destinations.forEach((d, i) => {
        text += `${i + 1}. **${d.name}**\n`
        if (d.startDate || d.endDate) {
          text += `   - Dates: ${d.startDate || '?'} to ${d.endDate || '?'}\n`
        }
        text += `   - ${d.description}\n\n`
      })
    }

    if (tripState.hotels.length > 0) {
      text += `## Hotels\n\n`
      tripState.hotels.forEach(h => {
        text += `- **${h.name}** (${h.location})\n`
        if (h.checkIn || h.checkOut) {
          text += `  - Dates: ${h.checkIn || '?'} to ${h.checkOut || '?'}\n`
        }
        text += `  - ${h.description}\n\n`
      })
    }

    if (tripState.destinations.length >= 2) {
      text += `## Routes\n\n`
      for (let i = 0; i < tripState.destinations.length - 1; i++) {
        const from = tripState.destinations[i]
        const to = tripState.destinations[i + 1]
        const url = `https://www.rome2rio.com/map/${encodeURIComponent(from.searchName)}/${encodeURIComponent(to.searchName)}`
        text += `- ${from.name} → ${to.name}: [View on Rome2Rio](${url})\n`
      }
    }

    text += `\n---\n*Generated by Luxury Travel Planner*`

    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success')
    }).catch(() => {
      // Fallback: show in a modal
      const pre = document.createElement('pre')
      pre.textContent = text
      pre.style.cssText = 'max-height: 400px; overflow: auto; font-size: 12px;'
      alert('Copy this itinerary:\n\n' + text)
    })
  }

  function printItinerary() {
    const printWindow = window.open('', '_blank')
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${tripState.name || 'My Luxury Trip'}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
          h1 { border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
          h2 { color: #1a472a; margin-top: 30px; }
          .destination { margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 8px; }
          .destination h3 { margin: 0 0 5px 0; }
          .dates { color: #666; font-size: 14px; }
          .hotel { margin: 15px 0; padding-left: 20px; border-left: 3px solid #1a472a; }
          .route { margin: 10px 0; padding: 10px; background: #e8f4ea; border-radius: 4px; }
          a { color: #1a472a; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>${tripState.name || 'My Luxury Trip'}</h1>
    `

    if (tripState.destinations.length > 0) {
      html += `<h2>Destinations</h2>`
      tripState.destinations.forEach((d, i) => {
        html += `
          <div class="destination">
            <h3>${i + 1}. ${d.name}</h3>
            ${d.startDate || d.endDate ? `<p class="dates">${d.startDate || '?'} to ${d.endDate || '?'}</p>` : ''}
            <p>${d.description}</p>
          </div>
        `
      })
    }

    if (tripState.hotels.length > 0) {
      html += `<h2>Hotels</h2>`
      tripState.hotels.forEach(h => {
        html += `
          <div class="hotel">
            <h3>${h.name}</h3>
            <p><strong>${h.location}</strong></p>
            ${h.checkIn || h.checkOut ? `<p class="dates">${h.checkIn || '?'} to ${h.checkOut || '?'}</p>` : ''}
            <p>${h.description}</p>
          </div>
        `
      })
    }

    if (tripState.destinations.length >= 2) {
      html += `<h2>Routes</h2>`
      for (let i = 0; i < tripState.destinations.length - 1; i++) {
        const from = tripState.destinations[i]
        const to = tripState.destinations[i + 1]
        const url = `https://www.rome2rio.com/map/${encodeURIComponent(from.searchName)}/${encodeURIComponent(to.searchName)}`
        html += `<div class="route">${from.name} → ${to.name}: <a href="${url}" target="_blank">View on Rome2Rio</a></div>`
      }
    }

    html += `
        <hr style="margin-top: 40px;">
        <p style="color: #666; font-size: 12px;">Generated by Luxury Travel Planner • Sources: Condé Nast Traveler, Tablet Hotels, Rome2Rio</p>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // ============================================================================
  // PANEL STATE
  // ============================================================================

  let panelExpanded = tripState.destinations.length > 0 || tripState.hotels.length > 0

  function togglePanel() {
    panelExpanded = !panelExpanded
    rerender()
  }

  // ============================================================================
  // STYLES
  // ============================================================================

  const styles = {
    pageWrapper: 'min-vh-100 animated fadeIn',
    hero: 'pv4 pv5-ns flex items-center justify-center bg-dark-green near-white',
    main: 'bg-near-white near-black pb6',
    section: 'pa3 pa5-ns mw8 center',
    sectionAlt: 'pa3 pa5-ns mw8 center bg-white br3 mv4 shadow-1',
    heroTitle: 'f2 f1-ns fw7 tc ma0 ttu tracked',
    heroSubtitle: 'f5 f4-ns fw3 tc mt3 o-80 measure center',
    sectionTitle: 'f3 f2-ns fw7 mb4 dark-green bb b--dark-green pb2',
    subsectionTitle: 'f4 f3-ns fw6 mt4 mb3 dark-gray',
    cardGrid: 'flex flex-wrap nl3 nr3',
    card: 'w-100 w-50-m w-third-l pa3',
    cardInner: 'bg-white br3 pa3 shadow-1 h-100 flex flex-column relative',
    cardInnerAdded: 'bg-white br3 pa3 shadow-1 h-100 flex flex-column relative ba b--dark-green',
    cardTitle: 'f5 fw6 mb2 dark-green',
    pSmall: 'f6 lh-copy gray flex-grow-1',
    addBtn: 'mt3 pa2 br2 bn bg-dark-green near-white pointer dim f7 fw6 ttu tracked',
    addBtnAdded: 'mt3 pa2 br2 bn bg-light-gray gray f7 fw6 ttu tracked',
    extLink: 'link dark-green underline hover-green',
    sourceLink: 'f7 gray i mt3',
    footer: 'bg-near-black near-white pa4 tc',
    footerText: 'f6 o-70',
    // Panel styles
    panelToggle: 'fixed bottom-1 right-1 z-5 bg-dark-green near-white pa3 br3 shadow-2 pointer flex items-center gap2 dim',
    panelContainer: 'fixed bottom-0 right-0 z-4 w-100 w-auto-ns bg-white shadow-2 br3-ns br--top-ns overflow-hidden',
    panelHeader: 'bg-dark-green near-white pa3 flex items-center justify-between',
    panelBody: 'pa3 overflow-y-auto',
    tripItem: 'pa3 mb2 br2 bg-near-white flex items-start justify-between',
    tripItemActions: 'flex flex-column items-center ml2',
    iconBtn: 'bn bg-transparent pointer dim pa1 f6',
    dateInput: 'input-reset ba b--light-gray br2 pa2 f7 w-100',
    exportBtn: 'pa2 ph3 br2 bn pointer dim f7 fw6',
  }

  // ============================================================================
  // COMPONENT: Destination Card
  // ============================================================================

  function DestinationCard(dest) {
    const isAdded = tripState.destinations.some(d => d.id === dest.id)

    return html`
      <div class=${styles.card}>
        <div class=${isAdded ? styles.cardInnerAdded : styles.cardInner}>
          ${isAdded ? html`<span class="absolute top-0 right-0 pa2 f7 dark-green fw6">✓ In Trip</span>` : ''}
          <h4 class=${styles.cardTitle}>${dest.name}</h4>
          <p class=${styles.pSmall}>${dest.description}</p>
          <button
            class=${isAdded ? styles.addBtnAdded : styles.addBtn}
            onclick=${() => isAdded ? null : addDestination(dest)}
            disabled=${isAdded}
            aria-label=${isAdded ? 'Already added' : `Add ${dest.name} to trip`}
          >
            ${isAdded ? 'Added' : '+ Add to Trip'}
          </button>
        </div>
      </div>
    `
  }

  // ============================================================================
  // COMPONENT: Hotel Card
  // ============================================================================

  function HotelCard(hotel) {
    const isAdded = tripState.hotels.some(h => h.id === hotel.id)

    return html`
      <div class=${styles.card}>
        <div class=${isAdded ? styles.cardInnerAdded : styles.cardInner}>
          ${isAdded ? html`<span class="absolute top-0 right-0 pa2 f7 dark-green fw6">✓ In Trip</span>` : ''}
          <h4 class=${styles.cardTitle}>${hotel.name}</h4>
          <p class="f7 gray mb2">${hotel.location}</p>
          <p class=${styles.pSmall}>${hotel.description}</p>
          <div class="flex gap2 mt3">
            <button
              class=${isAdded ? styles.addBtnAdded : styles.addBtn}
              style="flex: 1"
              onclick=${() => isAdded ? null : addHotel(hotel)}
              disabled=${isAdded}
            >
              ${isAdded ? 'Added' : '+ Add to Trip'}
            </button>
            ${hotel.url ? html`
              <a href=${hotel.url} target="_blank" rel="noopener"
                 class="mt3 pa2 br2 ba b--dark-green dark-green bg-transparent pointer dim f7 fw6 ttu tracked no-underline tc"
                 style="flex: 1">
                View →
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `
  }

  // ============================================================================
  // COMPONENT: Trip Panel
  // ============================================================================

  function TripPanel() {
    const itemCount = tripState.destinations.length + tripState.hotels.length

    if (!panelExpanded) {
      return html`
        <button class=${styles.panelToggle} onclick=${togglePanel} aria-label="Open trip planner">
          <span class="f5">🧳</span>
          <span class="fw6">Trip${itemCount > 0 ? ` (${itemCount})` : ''}</span>
        </button>
      `
    }

    return html`
      <div class=${styles.panelContainer} style="max-height: 80vh; width: 100%; max-width: 420px;">
        <div class=${styles.panelHeader}>
          <input
            type="text"
            placeholder="Name your trip..."
            value=${tripState.name}
            oninput=${(e) => updateTripName(e.target.value)}
            class="input-reset bn bg-transparent near-white f5 fw6 w-100"
            style="outline: none;"
          />
          <button onclick=${togglePanel} class="bn bg-transparent near-white pointer f4 ml2" aria-label="Close panel">×</button>
        </div>

        <div class=${styles.panelBody} style="max-height: 60vh;">
          ${tripState.destinations.length === 0 && tripState.hotels.length === 0 ? html`
            <div class="tc pa4 gray">
              <p class="f5 mb2">Your trip is empty</p>
              <p class="f6">Browse destinations and hotels below, then click "+ Add to Trip" to start building your itinerary.</p>
            </div>
          ` : ''}

          ${tripState.destinations.length > 0 ? html`
            <div class="mb4">
              <h4 class="f6 ttu tracked gray mb3">Destinations (${tripState.destinations.length})</h4>
              ${tripState.destinations.map((d, idx) => html`
                <div class=${styles.tripItem}>
                  <div class="flex-grow-1">
                    <div class="flex items-center gap2 mb2">
                      <span class="f6 fw6 bg-dark-green near-white br-100 w2 h2 flex items-center justify-center">${idx + 1}</span>
                      <span class="fw6">${d.name}</span>
                    </div>
                    <div class="flex gap2 mt2">
                      <input
                        type="date"
                        class=${styles.dateInput}
                        value=${d.startDate}
                        onchange=${(e) => updateDestinationDate(d.tripId, 'startDate', e.target.value)}
                        aria-label="Start date"
                      />
                      <span class="self-center gray">→</span>
                      <input
                        type="date"
                        class=${styles.dateInput}
                        value=${d.endDate}
                        onchange=${(e) => updateDestinationDate(d.tripId, 'endDate', e.target.value)}
                        aria-label="End date"
                      />
                    </div>
                  </div>
                  <div class=${styles.tripItemActions}>
                    <button
                      class=${styles.iconBtn}
                      onclick=${() => moveDestination(d.tripId, -1)}
                      disabled=${idx === 0}
                      aria-label="Move up"
                      style=${idx === 0 ? 'opacity: 0.3' : ''}
                    >↑</button>
                    <button
                      class=${styles.iconBtn}
                      onclick=${() => moveDestination(d.tripId, 1)}
                      disabled=${idx === tripState.destinations.length - 1}
                      aria-label="Move down"
                      style=${idx === tripState.destinations.length - 1 ? 'opacity: 0.3' : ''}
                    >↓</button>
                    <button
                      class="${styles.iconBtn} dark-red"
                      onclick=${() => removeDestination(d.tripId)}
                      aria-label="Remove"
                    >×</button>
                  </div>
                </div>
              `)}
            </div>
          ` : ''}

          ${tripState.hotels.length > 0 ? html`
            <div class="mb4">
              <h4 class="f6 ttu tracked gray mb3">Hotels (${tripState.hotels.length})</h4>
              ${tripState.hotels.map(h => html`
                <div class=${styles.tripItem}>
                  <div class="flex-grow-1">
                    <div class="fw6 mb1">${h.name}</div>
                    <div class="f7 gray mb2">${h.location}</div>
                    <div class="flex gap2 mt2">
                      <input
                        type="date"
                        class=${styles.dateInput}
                        value=${h.checkIn}
                        onchange=${(e) => updateHotelDate(h.tripId, 'checkIn', e.target.value)}
                        aria-label="Check-in date"
                      />
                      <span class="self-center gray">→</span>
                      <input
                        type="date"
                        class=${styles.dateInput}
                        value=${h.checkOut}
                        onchange=${(e) => updateHotelDate(h.tripId, 'checkOut', e.target.value)}
                        aria-label="Check-out date"
                      />
                    </div>
                  </div>
                  <button
                    class="${styles.iconBtn} dark-red"
                    onclick=${() => removeHotel(h.tripId)}
                    aria-label="Remove"
                  >×</button>
                </div>
              `)}
            </div>
          ` : ''}

          ${tripState.destinations.length >= 2 ? html`
            <div class="mb4">
              <h4 class="f6 ttu tracked gray mb3">Routes</h4>
              ${tripState.destinations.slice(0, -1).map((d, idx) => {
                const next = tripState.destinations[idx + 1]
                const routeUrl = `https://www.rome2rio.com/map/${encodeURIComponent(d.searchName)}/${encodeURIComponent(next.searchName)}`
                return html`
                  <a
                    href=${routeUrl}
                    target="_blank"
                    rel="noopener"
                    class="db pa2 mb2 br2 bg-lightest-blue dark-blue no-underline hover-bg-light-blue"
                  >
                    <span class="fw6">${d.name}</span>
                    <span class="mh2">→</span>
                    <span class="fw6">${next.name}</span>
                    <span class="fr f7">Rome2Rio ↗</span>
                  </a>
                `
              })}
            </div>
          ` : ''}

          ${itemCount > 0 ? html`
            <div class="bt b--light-gray pt3 mt3">
              <div class="flex gap2 mb2">
                <button class="${styles.exportBtn} bg-dark-green near-white flex-grow-1" onclick=${exportAsText}>
                  📋 Copy as Text
                </button>
                <button class="${styles.exportBtn} bg-navy near-white flex-grow-1" onclick=${printItinerary}>
                  🖨 Print
                </button>
              </div>
              <button class="${styles.exportBtn} bg-near-white dark-red w-100" onclick=${clearTrip}>
                Clear Trip
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // ============================================================================
  // COMPONENT: Onboarding Hint
  // ============================================================================

  function OnboardingHint() {
    if (tripState.destinations.length > 0 || tripState.hotels.length > 0) return ''

    return html`
      <div class="mw8 center pa3 pa4-ns">
        <div class="pa4 br3 bg-washed-yellow flex items-center gap3">
          <span class="f3">👋</span>
          <div>
            <p class="fw6 mb1">Ready to plan your luxury trip?</p>
            <p class="f6 gray ma0">Browse the destinations and hotels below. Click "+ Add to Trip" to start building your personalized itinerary.</p>
          </div>
        </div>
      </div>
    `
  }

  // ============================================================================
  // MAIN PAGE RENDER
  // ============================================================================

  function renderPage() {
    render(document.body, html`
<style>
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
  .gap2 { gap: 0.5rem; }
  .gap3 { gap: 1rem; }
</style>

<custom-header/>
<div class=${styles.pageWrapper}>

<!-- Hero Section -->
<section class=${styles.hero}>
  <div class="tc pa4">
    <h1 class=${styles.heroTitle}>Luxury Travel Planner</h1>
    <p class=${styles.heroSubtitle}>Build your dream itinerary with curated destinations from Condé Nast Traveler, boutique hotels from Tablet, and routes from Rome2Rio.</p>
  </div>
</section>

<main class=${styles.main}>

${OnboardingHint()}

<!-- Destinations Section -->
<section class=${styles.section}>
  <h2 class=${styles.sectionTitle}>Condé Nast Traveler Destinations</h2>
  <p class="lh-copy measure-wide mb4">The editors' picks for the most exceptional destinations. Click "+ Add to Trip" to include them in your itinerary.</p>

  <h3 class=${styles.subsectionTitle}>2026 Must-Visit Destinations</h3>
  <div class=${styles.cardGrid}>
    ${destinations2026.map(d => DestinationCard(d))}
  </div>

  <h3 class=${styles.subsectionTitle}>2025 Highlights</h3>
  <div class=${styles.cardGrid}>
    ${destinations2025.map(d => DestinationCard(d))}
  </div>

  <p class=${styles.sourceLink}>Source: <a class=${styles.extLink} href="https://www.cntraveler.com/" target="_blank" rel="noopener">Condé Nast Traveler</a></p>
</section>

<!-- Hotels Section -->
<section class=${styles.sectionAlt}>
  <h2 class=${styles.sectionTitle}>Tablet Hotels Collection</h2>
  <p class="lh-copy measure-wide mb4">Hand-picked boutique and luxury properties. Add your favorites to keep them organized.</p>

  <h3 class=${styles.subsectionTitle}>Top-Rated Hotels of All Time</h3>
  <div class=${styles.cardGrid}>
    ${hotelsTopRated.map(h => HotelCard(h))}
  </div>

  <h3 class=${styles.subsectionTitle}>Best New Properties 2025</h3>
  <div class=${styles.cardGrid}>
    ${hotelsNew2025.map(h => HotelCard(h))}
  </div>

  <h3 class=${styles.subsectionTitle}>Coming in 2026</h3>
  <div class=${styles.cardGrid}>
    ${hotels2026.map(h => HotelCard(h))}
  </div>

  <p class=${styles.sourceLink}>Source: <a class=${styles.extLink} href="https://www.tablethotels.com/" target="_blank" rel="noopener">Tablet Hotels</a></p>
</section>

<!-- Rome2Rio Section -->
<section class=${styles.section}>
  <h2 class=${styles.sectionTitle}>Route Planning with Rome2Rio</h2>
  <p class="lh-copy measure-wide mb4">Once you've added destinations to your trip, routes between them will automatically appear in your Trip Panel with direct links to Rome2Rio.</p>

  <div class="pa4 br3 bg-lightest-blue">
    <h3 class="f4 fw6 mb3 dark-blue">How It Works</h3>
    <div class="flex flex-wrap gap3">
      <div class="w-100 w-third-ns pa3 tc">
        <div class="f2 mb2">1</div>
        <p class="f6 gray">Add 2+ destinations to your trip using the cards above</p>
      </div>
      <div class="w-100 w-third-ns pa3 tc">
        <div class="f2 mb2">2</div>
        <p class="f6 gray">Open your Trip Panel (bottom right) to see auto-generated routes</p>
      </div>
      <div class="w-100 w-third-ns pa3 tc">
        <div class="f2 mb2">3</div>
        <p class="f6 gray">Click any route to open Rome2Rio and compare transport options</p>
      </div>
    </div>
  </div>

  <div class="mt4 pa4 br3 bg-near-white">
    <h4 class="f5 fw6 mb3">Rome2Rio Coverage</h4>
    <div class="flex flex-wrap">
      <div class="w-50 w-25-ns pa2">
        <div class="f3 fw7 dark-green">240+</div>
        <div class="f7 gray">Countries</div>
      </div>
      <div class="w-50 w-25-ns pa2">
        <div class="f3 fw7 dark-green">200K</div>
        <div class="f7 gray">Train Lines</div>
      </div>
      <div class="w-50 w-25-ns pa2">
        <div class="f3 fw7 dark-green">970K</div>
        <div class="f7 gray">Bus Routes</div>
      </div>
      <div class="w-50 w-25-ns pa2">
        <div class="f3 fw7 dark-green">53K</div>
        <div class="f7 gray">Flight Paths</div>
      </div>
    </div>
  </div>

  <p class="${styles.sourceLink} mt4">Source: <a class=${styles.extLink} href="https://www.rome2rio.com/" target="_blank" rel="noopener">Rome2Rio</a></p>
</section>

<!-- Tips Section -->
<section class=${styles.sectionAlt}>
  <h2 class=${styles.sectionTitle}>Pro Tips</h2>

  <div class="flex flex-wrap nl3 nr3">
    <div class="w-100 w-50-ns pa3">
      <div class="pa3 br2 bg-near-white h-100">
        <h4 class="f5 fw6 dark-green mb2">🗓 Set Your Dates</h4>
        <p class="f6 gray lh-copy">Add dates to each destination in the Trip Panel. This helps you visualize your timeline and plan realistic transitions.</p>
      </div>
    </div>
    <div class="w-100 w-50-ns pa3">
      <div class="pa3 br2 bg-near-white h-100">
        <h4 class="f5 fw6 dark-green mb2">↕️ Reorder Stops</h4>
        <p class="f6 gray lh-copy">Use the up/down arrows in the Trip Panel to reorder destinations. Routes update automatically.</p>
      </div>
    </div>
    <div class="w-100 w-50-ns pa3">
      <div class="pa3 br2 bg-near-white h-100">
        <h4 class="f5 fw6 dark-green mb2">🔗 Match Hotels to Destinations</h4>
        <p class="f6 gray lh-copy">When adding hotels, note the location — pair them with nearby destinations for a cohesive trip.</p>
      </div>
    </div>
    <div class="w-100 w-50-ns pa3">
      <div class="pa3 br2 bg-near-white h-100">
        <h4 class="f5 fw6 dark-green mb2">💾 Auto-Saved</h4>
        <p class="f6 gray lh-copy">Your trip is automatically saved to your browser. Come back anytime to continue planning.</p>
      </div>
    </div>
  </div>
</section>

</main>

<footer class=${styles.footer}>
  <p class=${styles.footerText}>Sources: Condé Nast Traveler • Tablet Hotels • Rome2Rio</p>
  <p class="${styles.footerText} mt2"><a href="/" class="link near-white underline">← Back to Home</a></p>
</footer>

</div>

${TripPanel()}
`)
  }

  // Initial render
  renderPage()
}
