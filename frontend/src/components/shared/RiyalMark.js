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
 * Sized in `em` so it tracks the type it sits beside, and drawn with strokes so
 * the weight stays even at the 10px price labels in the filter sidebar.
 */
export default function RiyalMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="SAR"
      focusable="false"
      className={`inline-block h-[0.82em] w-[0.82em] align-[-0.06em] ${className}`}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M78 26 H40 C24 26 16 36 16 50 C16 62 24 70 36 73" />
        <path d="M50 47 H88" />
        <path d="M50 69 H88" />
      </g>
    </svg>
  );
}
