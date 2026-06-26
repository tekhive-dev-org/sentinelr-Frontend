/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e06f29',
        primaryHover: '#c95f20',
        secondary: '#3d09d0',
        secondaryHover: '#32109f',
        danger: '#dc323f',
        warning: '#e6ae12',
        success: '#e6ae12',
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
