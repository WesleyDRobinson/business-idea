import '/js/components/custom-header.js'

export const showTerms = function showTerms() {
  const { render, html } = lighterhtml
  const pageWrapper = `h-80 animated fadeIn flex flex-column justify-between`
  const transitionAll = `transition: all 1s ease;`

  const main = `flex-grow-1 bg-near-white`
  const footer = `bg-near-black`

  const mainSection = `pa3 pa4-ns`
  const footerSection = `center mw6 pa2 pa3-ns flex justify-between`

  const h = `mv0 lh-title`
  const h2 = `${h}`
  const p = `measure lh-copy`

  const button = `button-reset pv2 ph3 br-pill bn f7 f6-ns`

  render(document.body, html`
<custom-header/>
<div class=${pageWrapper}>
        
<main class=${main} style=${transitionAll}>
  <section class=${mainSection} style=${transitionAll}>
    <h2 class=${h2} style=${transitionAll}>
      Terms of Service
    </h2>
    
    <p class=${p} style=${transitionAll}>
      Thanks for checking out our page.</p>
      
    <p class=${p} style=${transitionAll}>
      By using this service, you agree to our terms of service.</p>
        
    <p class=${p} style=${transitionAll}>
      If you give us your email, you're consenting to our using that email to contact you later.</p>
       
    <p class=${p} style=${transitionAll}>
      We won't sell your information to others.</p></section></main>
      
<footer class=${footer} style=${transitionAll}>
  <section class=${footerSection}>
    <button class=${button} onclick=${changeMainColors} data-theme="random">
      Change colors</button>
      
    <button class=${button} onclick=${changeMainColors} data-theme="original">
      Original color</button>
    
    <button class=${button} onclick=${changeMainColors} data-theme="dark">
      Dark mode</button></section></footer>
 
</div>
`)
}

function changeMainColors(e) {
  e.preventDefault()

  // array of possible colors
  const colors = [
    'near-black',
    'near-white',
    'black-80',
    'white-80',
    'dark-red',
    'red',
    'light-red',
    'orange',
    'gold',
    'yellow',
    'light-yellow',
    'purple',
    'light-purple',
    'dark-pink',
    'hot-pink',
    'pink',
    'light-pink',
    'dark-green',
    'green',
    'light-green',
    'navy',
    'dark-blue',
    'blue',
    'light-blue',
    'lightest-blue',
    'washed-blue',
    'washed-green',
    'washed-yellow',
    'washed-red'
  ]

  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const themes = {
    random: ` ${randomColor()} bg-${randomColor()}`,
    original: ' bg-white-80 near-black',
    dark: ' bg-black-80 near-white',
  }

  // grab main element & remove all colors
  const main = document.querySelector('main')
  colors.forEach(color => {
    const bg = `bg-${color}`
    main.classList.remove(color)
    main.classList.remove(bg)
  })

  // add targetedColors to main
  const targetTheme = e.target.getAttribute('data-theme')
  main.className += themes[targetTheme]

  // extra
  const colorsO = {
    'dark-red': true,
    'red': true,
    'light-red': true,
    'orange': true,
    'gold': true,
    'yellow': true,
    'light-yellow': true,
    'purple': true,
    'light-purple': true,
    'dark-pink': true,
    'hot-pink': true,
    'pink': true,
    'light-pink': true,
    'dark-green': true,
    'green': true,
    'light-green': true,
    'navy': true,
    'dark-blue': true,
    'blue': true,
    'light-blue': true,
    'lightest-blue': true,
    'washed-blue': true,
    'washed-green': true,
    'washed-yellow': true,
    'washed-red': true,
  }

  function colorsOIncludes(c) {
    let test = c.startsWith('bg-') ? c.slice(3) : c
    return colorsO.includes(test)
  }
}
