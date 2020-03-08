const { render, html } = lighterhtml
const { define, get, upgrade, whenDefined } = wickedElements

define('contact-us', {
  init() {
    this.render()
  },
  render() {
    const link = `link pointer dark-green`
    const top = `${link} ml3 pa2 f7 fw5`

    const h2 = `f4 fw7 ttu`

    return render(this.element, html`
<section class="pt5 pb4" id="contact-us">
  <h2 class=${h2}>contact <a href="/"><span class=${top}>top</span></a></h2>
  <form class="center pa4">
    <fieldset class="bn ma0 pa0">
      <legend class="pa0 f5 f4-ns mb3 black-80">Sign up for our newsletter</legend>
      <div class="flex">
        <label class="clip" for="email-address">Email Address</label>
        <input class="input-reset bn black-80 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns f6 f5-l"
               placeholder="Your Email Address" type="text" name="email-address" value="" id="email-address">
          <input
            class="button-reset pv3 tc bn bg-animate bg-green hover-bg-dark-green white pointer w-100 w-25-m w-20-l br2-ns br--right-ns f6 f5-l"
            type="submit" value="Subscribe">
      </div>
    </fieldset>
  </form>
</section>
`
    )
  },
  onsubmit(e) {
    e.preventDefault()

    const [,input] = e.target
    if (!input.value) return
    const slackUrl = 'https://hooks.slack.com/services/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'
    const body = JSON.stringify({ text: `${input.value} wants your newsletter` })

    const send = true
    if (send) {
      fetch(slackUrl, {
        method: 'POST',
        body,
      })
        .then(r => console.log(r))
        .catch(e => console.error(e))
      e.target.reset()
    }
  }
})
