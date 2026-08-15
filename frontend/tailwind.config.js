/** @type {import('tailwindcss').Config} */

// "Arcade" direction — dark chassis, acid accent, mono telemetry labels,
// angular cuts and hard offset shadows. Token names mirror the design doc.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#06070a", // page ground
        chassis: "#0b0c0f", // screen body
        panel: "#0f1116", // raised panel / header bar
        well: "#14161b", // image wells, inset surfaces
        line: "#2a2e37", // standard hairline
        seam: "#1c2027", // faint hairline between table rows
        edge: "#4a505c", // secondary button border
        muted: "#5d636e", // tertiary text
        dim: "#8b919c", // body text
        ink: "#f2f3f5", // primary text
        acid: {
          DEFAULT: "#ccff00",
          hi: "#e4ff6b",
        },
        magenta: "#ff2e6b",
        amber: "#ffb020",
      },
      fontFamily: {
        display: ["'Chakra Petch'", "sans-serif"],
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        // Arabic counterparts — Cairo for display, Plex Sans Arabic for body.
        "display-ar": ["Cairo", "sans-serif"],
        "sans-ar": ["'IBM Plex Sans Arabic'", "sans-serif"],
      },
      letterSpacing: {
        telemetry: "0.14em",
        badge: "0.1em",
        wordmark: "0.06em",
      },
      boxShadow: {
        // The signature hard offset — no blur, magenta behind acid.
        offset: "5px 5px 0 #ff2e6b",
        "offset-sm": "4px 4px 0 #ff2e6b",
        menu: "6px 6px 0 rgba(0,0,0,.5)",
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)",
        "scanlines-faint":
          "repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 1px,transparent 1px 4px)",
      },
      keyframes: {
        tick: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        tickrtl: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(50%)" },
        },
      },
      animation: {
        tick: "tick 24s linear infinite",
        tickrtl: "tickrtl 24s linear infinite",
      },
    },
  },
  plugins: [],
};
