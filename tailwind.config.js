/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
content: [
  "./app/**/*.{ts,tsx,js,jsx}",
  "./pages/**/*.{ts,tsx,js,jsx}",
  "./components/**/*.{ts,tsx,js,jsx}",
  "!./app/**/node_modules/**/*",
],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00",
        "accent-orange": "#FF8A3D",
        "slate-text": "#1E1E1E",
        "slate-text-dark": "#FFFFFF",
        "background-light": "#FDFCFB",
        "background-dark": "#000000",
        "card-dark": "#0D0D0D",
        "custom-blue": "#3B82F6",
        "custom-purple": "#8B5CF6",
        yellow: "#FACC15",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        stars: "url(https://www.transparenttextures.com/patterns/stardust.png)",
      },
    },
  },
  plugins: [],
};