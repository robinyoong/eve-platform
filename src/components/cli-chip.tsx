"use client";

import { useState } from "react";

type CliChipProps = {
  command: string;
  className?: string;
};

export function CliChip({ command, className = "" }: CliChipProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group inline-flex items-center gap-3 rounded-lg border border-border bg-panel px-3.5 py-2.5 font-mono text-sm text-fg transition-colors hover:border-fg-muted/40 ${className}`}
      aria-label={`Copy command: ${command}`}
    >
      <span className="text-fg-muted select-none">$</span>
      <span className="text-left">{command}</span>
      <span className="ml-1 text-xs text-fg-muted transition-colors group-hover:text-fg">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
