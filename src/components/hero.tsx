import { CliChip } from "@/components/cli-chip";
import { AgentDirectory } from "@/components/agent-directory";
import { INIT_COMMAND } from "@/lib/tutorial";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
        <div>
          <p className="animate-fade-up font-mono text-5xl font-medium tracking-tight text-fg sm:text-6xl">
            eve
          </p>
          <h1 className="animate-fade-up-delay-1 mt-5 max-w-xl text-2xl font-semibold tracking-tight text-fg sm:text-3xl sm:leading-snug">
            Learn to build agents
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-md text-base leading-7 text-fg-muted sm:text-lg">
            Like Next.js for web apps, but for agents. Markdown for
            instructions and skills, TypeScript for tools. Durable by default.
          </p>
          <div className="animate-fade-up-delay-3 mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              href="#get-started"
              className="inline-flex h-10 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90"
            >
              Start learning
            </a>
            <CliChip command={INIT_COMMAND} />
          </div>
        </div>

        <div className="animate-fade-up-delay-2 relative">
          <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),_transparent_65%)]" />
          <AgentDirectory activeId="instructions" />
          <div className="mt-3 rounded-lg border border-border bg-code-bg px-4 py-3 font-mono text-xs text-fg-muted">
            <span className="text-fg">$</span> eve dev
            <span className="ml-3 text-fg/80">agent ready on :3000</span>
          </div>
        </div>
      </div>
    </section>
  );
}
