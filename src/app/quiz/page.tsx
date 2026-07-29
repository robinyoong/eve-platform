import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QuizGame } from "@/components/quiz-game";

export const metadata: Metadata = {
  title: "Eve Quiz — Test Your Agent Framework Knowledge",
  description:
    "Ten tricky multiple-choice questions on Eve's agent filesystem, tools, sandbox, channels, and Vercel platform primitives.",
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-2xl px-6 py-20">
            <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
              Quiz
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              How well do you know Eve?
            </h1>
            <p className="mt-4 text-base leading-7 text-fg-muted">
              Ten questions on the agent filesystem, defineAgent, skills,
              sandbox backends, and platform primitives. No obvious trivia —
              read the distractors carefully.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-12 pb-24">
          <QuizGame />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
