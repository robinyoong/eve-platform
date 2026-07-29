import { CliChip } from "@/components/cli-chip";
import { INIT_COMMAND } from "@/lib/tutorial";

export function FinalCTA() {
  return (
    <section id="get-started" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Build your first agent
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-fg-muted">
          Scaffold a project, describe your agent in Markdown, and ship durable
          production agents on Vercel.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CliChip command={INIT_COMMAND} />
          <a
            href="https://vercel.com/docs/eve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm text-fg transition-colors hover:border-fg-muted/50 hover:bg-panel"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
