import page from '/js/lib/page.mjs'
window.page = page

const { render, html } = lighterhtml

// regexp for "tos" or "terms-of-service", case insensitive
page(/tos|terms-of-service/i, terms)

// old page style
page('*', initialize)
page(/about/i, about)
page(/contact/i, contact)

page('/', gotoTop)

page('*', '/')
page.exit(pageClosed)

page()

async function initialize(ctx, next) {
  await import('/js/components/app-shell.js');
  render(document.body, html`<app-shell/>`);
  next()
}

function gotoTop() {
  scrollIntoView('header')
}

function about() {
  scrollIntoView('about-us')
}

function contact() {
  scrollIntoView('contact-us')
}

async function terms() {
  const { showTerms } = await import('/js/pages/terms.js');
  showTerms()
}

function scrollIntoView(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth" })
}

function pageClosed(ctx, next) {
  // console.log('page closed', ctx)
  next()
}
