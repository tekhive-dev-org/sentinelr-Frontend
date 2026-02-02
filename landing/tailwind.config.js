/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#e07030',
        'secondary-green': '#e03040',
        'accent-blue': '#4000d0',
        'warm-yellow': '#e0b010',
        'deep-forest': '#12061e',
        'light-mint': '#fff3e8',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Space Grotesk', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'bio-pulse': 'bio-pulse 8s ease-in-out infinite',
        'sphere-pulse': 'sphere-pulse 6s ease-in-out infinite',
        'orbit': 'orbit 15s linear infinite',
        'text-glow': 'text-glow 4s ease-in-out infinite',
        'logo-glow': 'logo-glow 3s ease-in-out infinite',
        'logo-rotate': 'logo-rotate 10s linear infinite',
        'icon-pulse': 'icon-pulse 3s ease-in-out infinite',
        'fadeInSlide': 'fadeInSlide 0.6s ease-out',
        'expand-ring': 'expand-ring 4s ease-in-out infinite',
        'node-pulse': 'node-pulse 3s ease-in-out infinite',
        'feature-float': 'feature-float 6s ease-in-out infinite',
      },
      keyframes: {
        'bio-pulse': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'sphere-pulse': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', boxShadow: '0 0 60px rgba(224, 112, 48, 0.2)' },
          '50%': { transform: 'scale(1.1) rotate(180deg)', boxShadow: '0 0 80px rgba(64, 0, 208, 0.2)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'text-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 18px rgba(224, 112, 48, 0.2))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(64, 0, 208, 0.2))' },
        },
        'logo-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(224, 112, 48, 0.25)' },
          '50%': { boxShadow: '0 0 30px rgba(64, 0, 208, 0.2)' },
        },
        'logo-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'icon-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(224, 112, 48, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(64, 0, 208, 0.2)' },
        },
        'fadeInSlide': {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'expand-ring': {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.3' },
          '50%': { transform: 'scale(1.2)', opacity: '0.6' },
        },
        'node-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
        'feature-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', boxShadow: '0 0 30px rgba(224, 112, 48, 0.2)' },
          '50%': { transform: 'translateY(-10px) rotate(180deg)', boxShadow: '0 10px 40px rgba(64, 0, 208, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
