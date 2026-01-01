import '/js/components/custom-header.js'

export const showLuxuryTravel = function showLuxuryTravel() {
  const { render, html } = lighterhtml

  // Layout classes
  const pageWrapper = `min-vh-100 animated fadeIn`
  const hero = `vh-50 flex items-center justify-center bg-dark-green near-white`
  const main = `bg-near-white near-black`
  const section = `pa3 pa5-ns mw8 center`
  const sectionAlt = `pa3 pa5-ns mw8 center bg-white br3 mv4 shadow-1`

  // Typography
  const heroTitle = `f2 f1-ns fw7 tc ma0 ttu tracked`
  const heroSubtitle = `f5 f4-ns fw3 tc mt3 o-80`
  const sectionTitle = `f3 f2-ns fw7 mb4 dark-green bb b--dark-green pb2`
  const subsectionTitle = `f4 f3-ns fw6 mt4 mb3 dark-gray`
  const cardTitle = `f5 fw6 mb2 dark-green`
  const p = `lh-copy measure-wide`
  const pSmall = `f6 lh-copy gray`

  // Cards & Grid
  const cardGrid = `flex flex-wrap nl3 nr3`
  const card = `w-100 w-50-m w-third-l pa3`
  const cardInner = `bg-white br2 pa3 shadow-1 h-100`

  // Links
  const extLink = `link dark-green underline hover-green`
  const sourceLink = `f7 gray i`

  // Footer
  const footer = `bg-near-black near-white pa4 tc`
  const footerText = `f6 o-70`

  render(document.body, html`
<custom-header/>
<div class=${pageWrapper}>

<!-- Hero Section -->
<section class=${hero}>
  <div class="tc pa4">
    <h1 class=${heroTitle}>Luxury Travel</h1>
    <p class=${heroSubtitle}>Curated experiences from the world's best travel sources</p>
  </div>
</section>

<main class=${main}>

<!-- Condé Nast Traveler Section -->
<section class=${section}>
  <h2 class=${sectionTitle}>Condé Nast Traveler Destinations</h2>
  <p class=${p}>The editors' picks for the most exceptional destinations to visit, featuring both emerging hotspots and timeless classics.</p>

  <h3 class=${subsectionTitle}>2026 Must-Visit Destinations</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Seville, Spain</h4>
        <p class=${pSmall}>Energy "squarely in the kitchens and bars" — edging into Spain's top tier of luxury city breaks with world-class dining and vibrant nightlife.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Boston, USA</h4>
        <p class=${pSmall}>America's 250th anniversary shines a spotlight on this historic capital, with 2026 Sail Boston and FIFA World Cup events.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Greek Islands</h4>
        <p class=${pSmall}>15 best islands including Paros, Sifnos, Santorini, and Crete — spanning the Cyclades, Dodecanese, and North Aegean.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Uluṟu-Kata Tjuṯa, Australia</h4>
        <p class=${pSmall}>New Signature Walk launching April 2026: a luxury four-night guided trek spanning 33.5 miles with glamping camps and a new ecolodge.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Brussels, Belgium</h4>
        <p class=${pSmall}>A rising star for 2026 with its blend of art nouveau architecture, world-renowned chocolate, and evolving culinary scene.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>East Coast of Barbados</h4>
        <p class=${pSmall}>The less-traveled Atlantic coast offers dramatic landscapes, local culture, and a more authentic Caribbean experience.</p>
      </div>
    </div>
  </div>

  <h3 class=${subsectionTitle}>2025 Highlights</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Queensland, Australia</h4>
        <p class=${pSmall}>Great Barrier Reef, thriving art scene in Cairns, the new Wangetti Trail, and new luxury resorts on the Whitsunday Islands.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Greenland</h4>
        <p class=${pSmall}>New international airports opening with direct flights from Copenhagen and New York to Nuuk via United Airlines.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>La Paz, Bolivia</h4>
        <p class=${pSmall}>"South America's most underrated foodie scene right now" — forging a reputation as a culinary hotspot.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Uganda</h4>
        <p class=${pSmall}>New luxury lodges in famous national parks, including Gorilla Forest Camp for seeing rare mountain gorillas.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Sussex, UK</h4>
        <p class=${pSmall}>New boutique hotels, creative art scene, and the new King Charles III England Coast Path.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Nicaragua's Emerald Coast</h4>
        <p class=${pSmall}>Laid-back vibes and boutique hotels in this renowned surf destination with unspoiled Pacific coastline.</p>
      </div>
    </div>
  </div>
  <p class=${sourceLink}>Source: <a class=${extLink} href="https://www.cntraveler.com/" target="_blank" rel="noopener">Condé Nast Traveler</a></p>
</section>

<!-- Tablet Hotels Section -->
<section class=${sectionAlt}>
  <h2 class=${sectionTitle}>Tablet Hotels Collection</h2>
  <p class=${p}>Hand-picked boutique and luxury properties that offer unforgettable experiences, not just rooms.</p>

  <h3 class=${subsectionTitle}>Top-Rated Hotels of All Time</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>The Whitby, New York</h4>
        <p class=${pSmall}>Brings the warmth and coziness of English hospitality to a neighborhood rich with American-style luxury. Firmdale competes with anyone in the world on comfort.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Hotel Chelsea, New York</h4>
        <p class=${pSmall}>Where every artist of significance lived, stayed, or hung out — from Mark Twain to Madonna. Freshly renovated for 21st-century boutique-hotel travelers.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Witt Istanbul</h4>
        <p class=${pSmall}>Designed by Autoban with modernist-inspired lush interiors, space-age lines in rich textures of wood and leather. Each suite includes living rooms and kitchens.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Ett Hem, Stockholm</h4>
        <p class=${pSmall}>Designed by Ilse Crawford — probably the finest example of current Scandinavian boutique hotel design: warm, luxe, eclectic coziness.</p>
      </div>
    </div>
  </div>

  <h3 class=${subsectionTitle}>Best New Properties 2025</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>The Shinmonzen, Kyoto</h4>
        <p class=${pSmall}>Nine-suite boutique hotel designed by Tadao Ando — arguably Japan's most eminent architect. A vision at once nostalgic and futuristic.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Azumi Setoda, Japan</h4>
        <p class=${pSmall}>First property from Adrian Zecha, founder of Aman Resorts. 140-year-old estate restored into a boutique ryokan on remote Ikuchijima island.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Chalet Sofija, Alps</h4>
        <p class=${pSmall}>Just five luxurious suites with equal emphasis on its gourmet restaurant. Intimate Alpine luxury at its finest.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Lilløy Lindenberg, Norway</h4>
        <p class=${pSmall}>A wild, rocky private island hotel in the North Sea — beautifully restored farmhouse in "antique Scandinavian folk style."</p>
      </div>
    </div>
  </div>

  <h3 class=${subsectionTitle}>Coming in 2026</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Zannier Bendor, Provence</h4>
        <p class=${pSmall}>A 17-acre private island retreat owned by the family behind Pernod Ricard. Opening spring 2026 with restaurants, diving, and multiple bars.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Mandarin Oriental Bangkok</h4>
        <p class=${pSmall}>Recently crowned the best luxury chain in the world, making it into the top 10 hotels in the World's 50 Best ranking.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Fogo Island Inn, Canada</h4>
        <p class=${pSmall}>Propped up on stilts above crashing waves, offering "a feeling that you're at the very edge of the earth."</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Lizard Island, Queensland</h4>
        <p class=${pSmall}>Explore the Great Barrier Reef with rooms boasting immediate access to the waters and marine life.</p>
      </div>
    </div>
  </div>
  <p class=${sourceLink}>Source: <a class=${extLink} href="https://www.tablethotels.com/" target="_blank" rel="noopener">Tablet Hotels</a></p>
</section>

<!-- Rome2Rio Section -->
<section class=${section}>
  <h2 class=${sectionTitle}>Plan Your Route with Rome2Rio</h2>
  <p class=${p}>Once you've chosen your destinations and hotels, Rome2Rio helps you discover the best way to get there — comparing every mode of transport available.</p>

  <div class="mt4 pa4 bg-lightest-blue br3">
    <h3 class="f4 fw6 mb3 dark-blue">What is Rome2Rio?</h3>
    <p class=${p}>Rome2Rio is the world's most comprehensive multi-modal transport journey planner. Search any city, town, landmark, or address and instantly see routes via plane, train, bus, ferry, car, bike share, and more unique options like water taxis, gondolas, and even helicopters.</p>
  </div>

  <h3 class=${subsectionTitle}>Why Use Rome2Rio for Trip Planning</h3>
  <div class=${cardGrid}>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Massive Coverage</h4>
        <p class=${pSmall}>240+ countries, 200,000 train lines, 970,000 bus routes, 13,000 ferries, and 53,000 flight paths worldwide.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Compare All Options</h4>
        <p class=${pSmall}>Plane vs. train vs. bus vs. car vs. ferry — see travel times, distances, and price estimates for each route side by side.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Multi-Destination Trips</h4>
        <p class=${pSmall}>Create, edit, and save routes to multiple destinations. Perfect for planning complex luxury itineraries.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Off-the-Beaten Path</h4>
        <p class=${pSmall}>Especially useful for smaller destinations not served by major airports — find ground transport options others miss.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Book Direct</h4>
        <p class=${pSmall}>Book through trusted partners from 5,000+ companies in 160+ countries, all from one search.</p>
      </div>
    </div>
    <div class=${card}>
      <div class=${cardInner}>
        <h4 class=${cardTitle}>Free Mobile App</h4>
        <p class=${pSmall}>Unlimited free route searches, expandable maps, and multi-language support on iOS and Android.</p>
      </div>
    </div>
  </div>

  <div class="mt4 pa4 bg-washed-green br3 tc">
    <h3 class="f4 fw6 mb3 dark-green">Ready to Plan?</h3>
    <p class="measure center lh-copy mb4">Enter your starting point and destination on Rome2Rio to discover all possible routes for your luxury journey.</p>
    <a href="https://www.rome2rio.com/" target="_blank" rel="noopener" class="link dib bg-dark-green near-white pv3 ph4 br-pill fw6 grow shadow-2">Visit Rome2Rio →</a>
  </div>
  <p class="${sourceLink} mt3">Source: <a class=${extLink} href="https://www.rome2rio.com/" target="_blank" rel="noopener">Rome2Rio</a></p>
</section>

<!-- Planning Tips Section -->
<section class=${sectionAlt}>
  <h2 class=${sectionTitle}>Putting It All Together</h2>
  <p class=${p}>The luxury travel planning workflow: pick your destinations, book your stays, plan your routes.</p>

  <div class="flex flex-wrap justify-around mt4">
    <div class="tc pa3 w-100 w-third-ns">
      <div class="f2 mb2">1</div>
      <h4 class="f5 fw6 dark-green">Choose Destinations</h4>
      <p class="f6 gray">Browse Condé Nast Traveler's curated lists for 2025-2026 destinations worth your time.</p>
    </div>
    <div class="tc pa3 w-100 w-third-ns">
      <div class="f2 mb2">2</div>
      <h4 class="f5 fw6 dark-green">Book Unique Stays</h4>
      <p class="f6 gray">Find boutique and luxury hotels on Tablet Hotels that match your travel style.</p>
    </div>
    <div class="tc pa3 w-100 w-third-ns">
      <div class="f2 mb2">3</div>
      <h4 class="f5 fw6 dark-green">Plan Your Routes</h4>
      <p class="f6 gray">Use Rome2Rio to map out the best transport options between each destination.</p>
    </div>
  </div>

  <div class="mt4 pa3 bg-near-white br2">
    <h4 class="f5 fw6 mb2">Quick Links</h4>
    <ul class="list pl0">
      <li class="pv2"><a class=${extLink} href="https://www.cntraveler.com/" target="_blank" rel="noopener">Condé Nast Traveler</a> — Best destinations and travel inspiration</li>
      <li class="pv2"><a class=${extLink} href="https://www.tablethotels.com/" target="_blank" rel="noopener">Tablet Hotels</a> — Curated boutique and luxury hotels</li>
      <li class="pv2"><a class=${extLink} href="https://www.rome2rio.com/" target="_blank" rel="noopener">Rome2Rio</a> — Multi-modal route planning</li>
    </ul>
  </div>
</section>

</main>

<footer class=${footer}>
  <p class=${footerText}>Sources: Condé Nast Traveler • Tablet Hotels • Rome2Rio</p>
  <p class="${footerText} mt2"><a href="/" class="link near-white underline">← Back to Home</a></p>
</footer>

</div>
`)
}
