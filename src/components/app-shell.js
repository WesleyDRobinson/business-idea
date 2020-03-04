import { define, get, upgrade, whenDefined } from 'wicked-elements';
import { render, html } from 'lighterhtml'

import './contact-us'
import './about-us'
import './custom-header'

const backgroundColor = 'near-white'

define('app-shell', {
  init() {
    this.element.className = `db bg-${backgroundColor}`

    this.render()
  },

  render() {
    const main = `ph4 bg-${backgroundColor}`
    const firstImageOpening = `vh-100 flex flex-column justify-around`

    const l = 'w1 white-90'
    const line = `f1 fw7 ttu tracked lh-title flex justify-around `

    return render(this.element, html`
<custom-header></custom-header>
  
<main class=${main}>
  <div class="" style="background: url(/images/tea_market.jpg) no-repeat center center fixed; background-size: cover;">
    <div class=${firstImageOpening}>
      <div class=${line}><span class=${l}>b</span><span class=${l}>u</span><span class=${l}>s</span><span class=${l}>i</span></div>
      <div class=${line}><span class=${l}>n</span><span class=${l}>e</span><span class=${l}>s</span><span class=${l}>s</span></div>
      <div class=${line}><span class=${l}>i</span><span class=${l}>d</span><span class=${l}>e</span><span class=${l}>a</span></div>
    </div>
  </div>
  
  <about-us></about-us>
  
  <div class="" style="background: url(/images/flowers_building_sfp.png) no-repeat center center fixed; background-size: cover;">
    <div class="vh-100"></div>
  </div>
  
  <contact-us></contact-us>

</main>
`)
  },
})
