/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070A08",
        panel: "#0D1210",
        edge: "#1D2521",
        felt: "#0E2C1E",
        mint: "#22C55E",
        gold: "#EAB308",
        chip: "#EF4444",
        mute: "#79857D",
        bone: "#F2F5F3",
        bone2: "#AEB8B1"
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
