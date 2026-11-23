/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Palette carried over from yourOwn dev/layoutDesign (theme.css + Timeline.tsx)
      colors: {
        cream: "#FCF3D9", // page background
        paper: "#FDFFE8", // timeline / content panels
        sage: {
          DEFAULT: "#4E5D4B", // primary text
          light: "#ACC2A7", // nav text, star
          mist: "#d7dfda", // nav hover
        },
        ember: "#E56565", // timeline track, social icons
        ink: "#0B0B0B", // dark-theme background (Photography)
      },
      fontFamily: {
        afacad: ["Afacad", "sans-serif"],
        didot: ["\"GFS Didot\"", "Didot", "\"Bodoni 72\"", "serif"],
      },
    },
  },
  plugins: [],
};
