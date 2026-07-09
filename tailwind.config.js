/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A1310",
        panel: "#0F1A15",
        edge: "#1F2C25",
        felt: "#0C3327",
        mint: "#34C48D",
        gold: "#D9A94C",
        chip: "#C74A44",
        mute: "#7B877E",
        bone: "#E8E2D2",
        bone2: "#C4BFB0"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};
