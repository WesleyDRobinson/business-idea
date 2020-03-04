import page from 'page'

window.page = page

page('*', initialize)
page('/about', about)
page('/contact', contact)
page('/', gotoTop)
page()

function initialize(ctx, next) {
  if (ctx.init) {
    next()
  } else {
    next()
  }
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

function scrollIntoView(id) {
  const el = document.getElementById(id)
  el.scrollIntoView({ behavior: "smooth" })
}
