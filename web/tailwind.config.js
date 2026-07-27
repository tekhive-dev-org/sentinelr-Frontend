/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: { 
      colors: {
        brand: {
          primary: '#e06f29',
          primaryHover: '#c95f20',
          secondary: '#3d09d0',
          secondaryHover: '#32109f',
          danger: '#dc323f',
          warning: '#e6ae12',
          surface: '#fffaf6',
          purpleSurface: '#f5f1ff',
          redSurface: '#fff0f1',
          yellowSurface: '#fff8e8',
        },
        'primary-green': '#e06f29',
        'deep-forest': '#12061e',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      screens: {
        mobile: { max: "640px" },
        tablet: { min: "641px", max: "1023px" },
        laptop: { min: "1024px" },
        Xlaptop: { min: "1440px" },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      maxWidth: {
        'container': '1200px',
      },
    },
  },
  plugins: [],
};
