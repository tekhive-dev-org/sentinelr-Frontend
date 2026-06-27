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
        sans: ['SpaceGrotesk_400Regular'],
        body: ['SpaceGrotesk_400Regular'],
        heading: ['PlayfairDisplay_700Bold'],
        space: ['SpaceGrotesk_400Regular'],
        spaceMedium: ['SpaceGrotesk_500Medium'],
        spaceSemiBold: ['SpaceGrotesk_600SemiBold'],
        spaceBold: ['SpaceGrotesk_700Bold'],
        playfair: ['PlayfairDisplay_700Bold'],
        playfairSemiBold: ['PlayfairDisplay_600SemiBold'],
        playfairExtraBold: ['PlayfairDisplay_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
