import React from "react";

/**
 * Shared shell for prose content pages (About, Shipping, Returns, Terms,
 * Privacy) — the header-bar + centered-column layout already established by
 * components/user/UserProfile.js. Pass `paragraphs` for a plain narrative
 * (About) or `sections` for a heading-per-topic page (everything else).
 */
export default function ContentPage({ title, intro, paragraphs = [], sections = [] }) {
  return (
    <div className="bg-chassis">
      <div className="border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{title}</h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-7">
        {intro ? <p className="m-0 mb-8 text-[15px] leading-relaxed text-dim">{intro}</p> : null}

        {paragraphs.length ? (
          <div className="flex flex-col gap-4">
            {paragraphs.map((body, index) => (
              <p key={index} className="m-0 text-sm leading-relaxed text-dim">
                {body}
              </p>
            ))}
          </div>
        ) : null}

        {sections.length ? (
          <div className="flex flex-col gap-7">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="m-0 mb-2.5 telemetry text-[11px] text-ink">{section.heading}</h2>
                <p className="m-0 text-sm leading-relaxed text-dim">{section.body}</p>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
