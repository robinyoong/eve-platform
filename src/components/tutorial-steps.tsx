"use client";

import { useEffect, useState } from "react";
import { AgentDirectory } from "@/components/agent-directory";
import { CodePanel } from "@/components/code-panel";
import { TUTORIAL_STEPS } from "@/lib/tutorial";

export function TutorialSteps() {
  const [activeId, setActiveId] = useState(TUTORIAL_STEPS[0]?.id ?? null);

  useEffect(() => {
    const sections = TUTORIAL_STEPS.map((step) => ({
      id: step.id,
      el: document.getElementById(`step-${step.id}`),
    })).filter((s): s is { id: string; el: HTMLElement } => !!s.el);

    if (sections.length === 0) return;

    const updateActive = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 48;

      if (nearBottom) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }

      const offset = window.innerHeight * 0.3;
      let current = sections[0].id;

      for (const { id, el } of sections) {
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return (
    <section id="learn" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Tutorial
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Build your first agent
          </h2>
          <p className="mt-4 text-base leading-7 text-fg-muted">
            Walk the filesystem from identity to tools, sandbox, and channels.
            Each step is a file eve already knows how to load.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AgentDirectory activeId={activeId} />
          </aside>

          <div className="space-y-16">
            {TUTORIAL_STEPS.map((step, index) => (
              <article
                key={step.id}
                id={`step-${step.id}`}
                className="scroll-mt-28"
              >
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-mono text-xs text-fg-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-mono text-xs text-fg-muted">{step.path}</p>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-fg">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-fg-muted">
                  {step.description}
                </p>
                <div className="mt-6">
                  <CodePanel tabs={step.tabs} filename={step.tabs[0]?.label} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
