import { render, html } from 'lighterhtml';
import { define, get, upgrade, whenDefined } from 'wicked-elements';

define('about-us', {
  init() {
    this.render()
  },
  render() {
    const link = `link pointer dark-green`
    const top = `${link} ml3 pa2 f7 fw5`

    const h2 = `f4 fw7 ttu pv4`

    return render(this.element, html`
<section class="pt5 pb4">
  <h2 class=${h2} id="about-us">About <a href="/"><span class=${top}>top</span></a></h2>
  <p class="times lh-copy measure f4 mt0">
    Business is the activity of making one's living or making money by producing or buying and selling products (such as goods and services). Simply put, it is any activity or enterprise entered into for profit. It does not mean it is a company, a corporation, partnership, or have any such formal organization, but it can range from a street peddler to General Motors. 
  </p>
</section>
`
    )
  },
})
