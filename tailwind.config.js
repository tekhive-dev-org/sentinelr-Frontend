/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: { 
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
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
