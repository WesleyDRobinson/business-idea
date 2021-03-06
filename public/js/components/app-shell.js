import '/js/components/custom-header.js';
import '/js/components/contact-us.js';
import '/js/components/about-us.js';

const { render, html } = lighterhtml
const { define } = wickedElements

define('app-shell', {
  init() {
    this.render()
  },

  render() {
    const main = `ph2 ph4-ns bg-near-white animated fadeIn`
    const bgImageClass = `vh-75 w-100 cover`
    const imageTextOverlay = `h-100 flex flex-column justify-around`

    const l = 'w1'
    const line = `ttu tracked lh-title white-90 f2 f1-ns fw7 flex justify-around`

    const { medium, large } = this.media

    const imageFirst = large
      ? '/images/flowers_building_sfp.png'
      : medium
        ? '/images/flowers_building_sfp_medium.png'
        : '/images/flowers_building_sfp_small.png'

    const imageSecond = large
      ? '/images/tea_market_large.jpg'
      : medium
        ? '/images/tea_market_medium.jpg'
        : '/images/tea_market_small.jpeg'


    const bgImageFirst = `background: url(${imageFirst}) no-repeat center center fixed; background-attachment:scroll;`
    const bgImageSecond = `background: url(${imageSecond}) no-repeat center center fixed; background-attachment:scroll;`

    return render(this.element, html`
<custom-header></custom-header>
  
<main class=${main}>

  <div class=${bgImageClass} style=${bgImageFirst}>
    <div class=${imageTextOverlay}>
      <div class=${line}><span class=${l}>b</span><span class=${l}>u</span><span class=${l}>s</span><span class=${l}>i</span></div>
      <div class=${line}><span class=${l}>n</span><span class=${l}>e</span><span class=${l}>s</span><span class=${l}>s</span></div>
      <div class=${line}><span class=${l}>i</span><span class=${l}>d</span><span class=${l}>e</span><span class=${l}>a</span></div>
    </div>
  </div>
  
  <about-us></about-us>
  
  <div class=${bgImageClass} style=${bgImageSecond}></div>
  
  <contact-us></contact-us>
</main>
`)
  },

  get media() {
    return {
      small: window.matchMedia('(max-width: 600px').matches,
      medium: window.matchMedia('(min-width: 600px)').matches,
      large: window.matchMedia('(min-width: 1200px)').matches,
    }
  }
})
