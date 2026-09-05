import React from "react";

/**
 * The Saudi Riyal currency mark, drawn rather than typed.
 *
 * The glyph is not in any of the app's fonts — prices render in Chakra Petch or
 * IBM Plex Mono, neither of which carries Arabic — so a character would have
 * fallen back to whatever the system had, or shown a tofu box. An inline SVG
 * renders identically everywhere and inherits colour and size from the text
 * around it, which is what a currency symbol has to do.
 *
 * Path data is the official SAR symbol (SAMA, 2025) traced from
 * https://commons.wikimedia.org/wiki/File:Saudi_Riyal_Symbol.svg, filled
 * rather than stroked so it stays true to the source glyph. Sized in `em`
 * so it tracks the type it sits beside; the aspect ratio comes from the
 * source viewBox since the mark is taller than it is wide.
 */
export default function RiyalMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 1124.14 1256.39"
      role="img"
      aria-label="SAR"
      focusable="false"
      className={`inline-block h-[0.95em] w-auto aspect-[1124.14/1256.39] align-[-0.06em] ${className}`}
    >
      <path
        fill="currentColor"
        d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
      />
      <path
        fill="currentColor"
        d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
      />
    </svg>
  );
}
