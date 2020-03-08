const { render, html } = lighterhtml
const { define, get, upgrade, whenDefined } = wickedElements

const headerColor = 'near-white'

define('custom-header', {
  init() {
    this.render()
  },
  render() {
    const header = `pa3 flex justify-between items-center bg-${headerColor}`
    const h1 = `f4 f3-m f2-l fw6 pl2 pv1`


    const navOl = `list flex flex-wrap justify-center content-around`
    const navLi = `ph2 ph3-ns pv0 pv2-ns`
    const navA = `link pointer dark-green`
    const navSpan = `ttu f7 f6-ns`

    const links = [
      { text: 'Home', path: '/' },
      { text: 'About', path: "/about", },
      { text: 'Contact', path: "/contact", },
      { text: 'TOS', path: "/tos", },
    ]

    return render(this.element, html`
<header class=${header} id="header">
  <h1 class=${h1}>Business Opportunity</h1>
  <nav><ol class=${navOl}>${
      links.map(link =>
        html`<li class=${navLi}><a class=${navA} href=${link.path}><span class=${navSpan}>${link.text}</span></a></li>`)}</ol></nav>
</header>
`
    )
  },
})
