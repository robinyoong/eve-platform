import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Quiz } from "@/components/quiz";

export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
            <Link
              href="/"
              className="text-sm text-fg-muted transition-colors hover:text-fg"
            >
              ← Back to home
            </Link>
            <p className="mt-8 font-mono text-xs tracking-wide text-fg-muted uppercase">
              Knowledge check
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              eve agent quiz
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-fg-muted">
              Ten multiple-choice questions on the agent directory model,
              tools, skills, channels, and schedules. The wrong answers are
              plausible on purpose.
            </p>
            <div className="mt-12">
              <Quiz />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
