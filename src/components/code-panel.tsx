"use client";

import { useState } from "react";
import type { CodeTab } from "@/lib/tutorial";

type CodePanelProps = {
  tabs: CodeTab[];
  filename?: string;
};

export function CodePanel({ tabs, filename }: CodePanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = tabs[activeIndex] ?? tabs[0];

  async function handleCopy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (!active) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto py-2">
          {tabs.length > 1 ? (
            tabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                  index === activeIndex
                    ? "bg-panel text-fg"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <span className="px-1.5 font-mono text-xs text-fg-muted">
              {filename ?? active.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
          aria-live="polite"
          className="shrink-0 px-2 py-1 text-xs text-fg-muted transition-colors hover:text-fg"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        key={`${active.label}-${activeIndex}`}
        className="animate-fade-cross overflow-x-auto p-4 font-mono text-[13px] leading-6 text-fg"
      >
        <code>{active.code}</code>
      </pre>
    </div>
  );
}
