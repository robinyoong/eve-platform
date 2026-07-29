import { AgentDirectory } from "@/components/agent-directory";

export function MentalModel() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Mental model
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            An agent is a directory
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-fg-muted">
            Define instructions and skills in markdown, tools in TypeScript,
            and deploy. The framework compiles the directory, wires up durable
            workflows, and connects channels.
          </p>
        </div>
        <AgentDirectory />
      </div>
    </section>
  );
}
