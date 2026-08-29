/** @type {import('tailwindcss').Config} */

// "Arcade" direction — dark chassis, acid accent, mono telemetry labels,
// angular cuts and hard offset shadows. Token names mirror the design doc.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Every value below is a CSS custom property (defined in src/index.css,
        // dark on :root, overridden by [data-theme="light"]) — no literal hex
        // lives here, so a theme toggle needs no Tailwind rebuild.
        void: "var(--color-void)", // page ground
        chassis: "var(--color-chassis)", // screen body
        panel: "var(--color-panel)", // raised panel / header bar
        well: "var(--color-well)", // image wells, inset surfaces
        line: "var(--color-line)", // standard hairline
        seam: "var(--color-seam)", // faint hairline between table rows
        edge: "var(--color-edge)", // secondary button border
        muted: "var(--color-muted)", // tertiary text
        dim: "var(--color-dim)", // body text
        ink: "var(--color-ink)", // primary text
        acid: {
          DEFAULT: "var(--color-acid)",
          hi: "var(--color-acid-hi)",
        },
        magenta: "var(--color-magenta)",
        amber: "var(--color-amber)",
        // Fixed neon regardless of theme — reserved for the logo mark
        // (components/shared/Brand.js), a brand-identity element that should
        // stay recognizable rather than adapt like everything else.
        brand: "var(--color-brand)",
        "brand-magenta": "var(--color-brand-magenta)",
        "on-brand": "var(--color-on-brand)",
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
          "repeating-linear-gradient(0deg,var(--scanline-rgba) 0 1px,transparent 1px 4px)",
        "scanlines-faint":
          "repeating-linear-gradient(0deg,var(--scanline-rgba-faint) 0 1px,transparent 1px 4px)",
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
