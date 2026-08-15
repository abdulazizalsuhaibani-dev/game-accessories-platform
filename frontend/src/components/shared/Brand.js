import React from "react";
import { Link } from "react-router-dom";

/**
 * The acid mark with its corner cut, plus the Game/Acc wordmark. The wordmark
 * stays Latin in both languages — it's the brand, not copy.
 */
export default function Brand({ to = "/", size = "md", badge }) {
  const mark = size === "sm" ? "h-5 w-5" : "h-[22px] w-[22px]";
  const word = size === "sm" ? "text-[15px]" : "text-[17px]";

  const content = (
    <>
      <span className={`${mark} flex-none bg-acid clip-mark`} aria-hidden="true" />
      <span
        className={`${word} font-display font-bold uppercase tracking-wordmark text-ink`}
        dir="ltr"
      >
        Game/Acc
      </span>
      {badge ? (
        <span className="bg-magenta px-1.5 py-[3px] font-mono text-[9px] font-semibold tracking-badge text-void">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (!to) {
    return <div className="flex items-center gap-2.5">{content}</div>;
  }

  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="Game/Acc home">
      {content}
    </Link>
  );
}
