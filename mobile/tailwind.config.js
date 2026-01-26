/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3e0d10',
        danger: '#db323f',
        warning: '#e6ad13',
        dark: '#000000',
        light: '#ffffff',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
