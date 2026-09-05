import React, { useState } from "react";
import { ReactComponent as MouseSketch } from "../images/sketches/mouse.svg";

/**
 * The recessed product surface used everywhere in the design: a themed well,
 * the artwork contained inside it, and an optional CRT scanline overlay.
 * Falls back to the line-art sketch when a product has no usable image.
 *
 * The sketch is an inline SVG component (not an <img src>) drawn with
 * `currentColor`, so it inherits `text-dim` below and stays visible against
 * the well's surface in both themes — an <img>-referenced SVG can't pick up
 * a CSS color at all.
 */
export default function ImageWell({
  src,
  alt = "",
  fallback: Fallback = MouseSketch,
  className = "",
  imageClassName = "",
  scanlines = false,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {showFallback ? (
        <Fallback
          aria-hidden={alt === "" ? "true" : undefined}
          className={`h-full w-full object-contain p-6 text-dim opacity-70 ${imageClassName}`}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-contain p-3 ${imageClassName}`}
        />
      )}
      {scanlines ? (
        <div className="pointer-events-none absolute inset-0 bg-scanlines" aria-hidden="true" />
      ) : null}
      {children}
    </div>
  );
}
