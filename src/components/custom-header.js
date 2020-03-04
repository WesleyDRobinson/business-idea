import { render, html } from 'lighterhtml';
import { define, get, upgrade, whenDefined } from 'wicked-elements';

const headerColor = 'near-white'

define('custom-header', {
  init() {
    this.render()
  },
  render() {
    const header = `pa3 flex justify-between items-center bg-${headerColor}`
    const left = ``
    const h1 = `f4 f3-m f2-l fw6 pl2 pv1`

    const link = `link pointer dark-green`

    const navLinkList = `list flex f6`
    const navLink = `${link} ttu f7 f5-ns ph2 ph3-ns ph4-ns pv2`

    return render(this.element, html`
<header class=${header} id="header">
  <div class=${left}>
    <h1 class=${h1}>Business Opportunity</h1>
  </div>  
  <nav>
    <ol class=${navLinkList}>
      <li><a class=${link} href="/"><span class=${navLink}>Home</span></a></li>    
      <li><a class=${link} href="/about"><span class=${navLink}>About</span></a></li>    
      <li><a class=${link} href="/contact"><span class=${navLink}>Contact</span></a></li>    
    </ol>
  </nav>
</header>
`
    )
  },
})
