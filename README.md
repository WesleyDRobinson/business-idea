# KBI - Business Opportunity

A modern, responsive single-page application showcasing business opportunities and ideas.

## Features

- **Responsive Design**: Mobile-first approach using Tachyons CSS framework
- **Client-Side Routing**: Smooth navigation with page.js
- **Modern JavaScript**: ES6+ modules and Web Components
- **Lightweight**: Minimal dependencies with lighterhtml and wicked-elements
- **Animated UI**: Smooth transitions and animations using Animate.css

## Tech Stack

- **lighterhtml**: Fast and lightweight HTML rendering
- **wicked-elements**: Custom web components framework
- **page.js**: Client-side routing
- **Tachyons**: Functional CSS framework
- **Vercel**: Deployment platform

## Project Structure

```
business-idea/
├── public/
│   ├── css/
│   │   ├── custom.css
│   │   └── tachyons.min.css
│   ├── images/
│   │   └── [responsive image assets]
│   ├── js/
│   │   ├── components/
│   │   │   ├── about-us.js
│   │   │   ├── app-shell.js
│   │   │   ├── contact-us.js
│   │   │   └── custom-header.js
│   │   ├── lib/
│   │   │   └── [third-party libraries]
│   │   ├── pages/
│   │   │   └── terms.js
│   │   └── routing.js
│   └── index.html
├── package.json
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd business-idea
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

### Development

Run the development server:

```bash
yarn dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### Deployment

Deploy to Vercel:

```bash
yarn deploy
# or
npm run deploy
```

## Components

### App Shell (`app-shell.js`)
Main application layout with responsive images and navigation.

### Custom Header (`custom-header.js`)
Navigation header with responsive design.

### About Us (`about-us.js`)
Business information section.

### Contact Us (`contact-us.js`)
Newsletter signup form.

### Terms (`terms.js`)
Terms of service page with theme customization.

## Routing

The application uses page.js for client-side routing:

- `/` - Home page
- `/about` - About section
- `/contact` - Contact section
- `/tos` or `/terms-of-service` - Terms of service

## License

ISC

## Author

wesley <wesleyr@tuta.io>
