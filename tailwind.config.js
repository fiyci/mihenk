/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E14",
        panel: "#121722",
        edge: "#1E2635",
        felt: "#0E3B2E",
        mint: "#2FBF8F",
        gold: "#E8B84B",
        chip: "#E25C5C",
        mute: "#7C8797"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};
