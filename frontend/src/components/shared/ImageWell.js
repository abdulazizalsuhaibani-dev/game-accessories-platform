import React, { useState } from "react";
import mouseSketch from "../images/sketches/mouse.svg";

/**
 * The recessed product surface used everywhere in the design: a #14161b well,
 * the artwork contained inside it, and an optional CRT scanline overlay.
 * Falls back to the line-art sketch when a product has no usable image.
 */
export default function ImageWell({
  src,
  alt = "",
  fallback = mouseSketch,
  className = "",
  imageClassName = "",
  scanlines = false,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? fallback : src;
  const isSketch = resolved === fallback;

  return (
    <div className={`relative overflow-hidden bg-well ${className}`}>
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-contain ${isSketch ? "p-6 opacity-70" : "p-3"} ${imageClassName}`}
      />
      {scanlines ? (
        <div className="pointer-events-none absolute inset-0 bg-scanlines" aria-hidden="true" />
      ) : null}
      {children}
    </div>
  );
}
