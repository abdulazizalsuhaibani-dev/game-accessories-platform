import React from "react";

/** The filter row above the admin grids in screens 09-11. */
export default function AdminTableToolbar({ query, setQuery, placeholder, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 border border-line bg-void px-3 focus-within:border-acid">
        <span className="font-mono text-[11px] font-semibold text-muted" aria-hidden="true">
          /
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </div>
      {children}
    </div>
  );
}
