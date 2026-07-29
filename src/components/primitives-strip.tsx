import { PRIMITIVES } from "@/lib/tutorial";

function PrimitiveIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    Workflows:
      "M4 8h16M4 16h10M14 12l4 4-4 4",
    "AI Gateway":
      "M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5",
    Sandbox:
      "M4 7h16v10H4zM8 7V5h8v2M9 12h6",
    Connect:
      "M8 12a4 4 0 0 1 4-4h2M16 12a4 4 0 0 1-4 4h-2M9 12h6",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-fg"
      aria-hidden
    >
      <path d={paths[name] ?? paths.Workflows} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PrimitivesStrip() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Leverages all Vercel AI primitives
          </h2>
          <p className="mt-4 text-base leading-7 text-fg-muted">
            AI Gateway for model calls, Sandboxes, Workflows, and Connect. All
            critical agent infrastructure works out of the box.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PRIMITIVES.map((primitive) => (
            <div
              key={primitive.name}
              className="bg-panel p-5 transition-colors hover:bg-code-bg"
            >
              <PrimitiveIcon name={primitive.name} />
              <h3 className="mt-4 text-sm font-medium text-fg">
                {primitive.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-fg-muted">
                {primitive.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
