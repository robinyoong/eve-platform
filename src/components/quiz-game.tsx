"use client";

import { useState } from "react";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

type Phase = "quiz" | "results";

export function QuizGame() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array.from({ length: QUIZ_QUESTIONS.length }, () => null)
  );

  const question = QUIZ_QUESTIONS[currentIndex];
  const selected = answers[currentIndex];
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const score = answers.reduce<number>((total, answer, index) => {
    if (answer === QUIZ_QUESTIONS[index].correctIndex) return total + 1;
    return total;
  }, 0);

  function selectOption(index: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = index;
      return next;
    });
  }

  function goNext() {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function submitQuiz() {
    if (allAnswered) setPhase("results");
  }

  function restart() {
    setPhase("quiz");
    setCurrentIndex(0);
    setAnswers(Array.from({ length: QUIZ_QUESTIONS.length }, () => null));
  }

  if (phase === "results") {
    return (
      <div className="animate-fade-up">
        <div className="rounded-xl border border-border bg-panel p-8 text-center">
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Final score
          </p>
          <p className="mt-3 font-mono text-5xl font-medium tracking-tight text-fg">
            {score}
            <span className="text-fg-muted">/{QUIZ_QUESTIONS.length}</span>
          </p>
          <p className="mt-3 text-sm text-fg-muted">
            {score === QUIZ_QUESTIONS.length
              ? "Perfect — you know Eve inside out."
              : score >= QUIZ_QUESTIONS.length * 0.7
                ? "Solid grasp of the agent filesystem and platform."
                : "Review the explanations below and try again."}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90"
          >
            Retake quiz
          </button>
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Review answers
          </h2>
          {QUIZ_QUESTIONS.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = userAnswer === q.correctIndex;

            return (
              <article
                key={q.id}
                className="rounded-lg border border-border bg-panel p-6"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                      isCorrect
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                    aria-hidden
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-fg-muted">
                      Question {qIndex + 1}
                    </p>
                    <p className="mt-1 text-base font-medium text-fg">
                      {q.question}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {q.options.map((option, oIndex) => {
                        const isUserPick = userAnswer === oIndex;
                        const isCorrectOption = oIndex === q.correctIndex;

                        let optionClass =
                          "border-border bg-code-bg text-fg-muted";
                        if (isCorrectOption) {
                          optionClass =
                            "border-emerald-500/40 bg-emerald-500/10 text-fg";
                        } else if (isUserPick && !isCorrect) {
                          optionClass =
                            "border-red-500/40 bg-red-500/10 text-fg";
                        }

                        return (
                          <li
                            key={oIndex}
                            className={`rounded-md border px-4 py-2.5 text-sm ${optionClass}`}
                          >
                            {option}
                            {isCorrectOption && (
                              <span className="ml-2 font-mono text-xs text-emerald-400">
                                correct
                              </span>
                            )}
                            {isUserPick && !isCorrectOption && (
                              <span className="ml-2 font-mono text-xs text-red-400">
                                your answer
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <p className="mt-4 text-sm leading-6 text-fg-muted">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-cross" key={question.id}>
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <span className="font-mono">
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(QUIZ_QUESTIONS.length).padStart(2, "0")}
          </span>
          <span>
            {answeredCount} of {QUIZ_QUESTIONS.length} answered
          </span>
        </div>
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={QUIZ_QUESTIONS.length}
        >
          <div
            className="h-full rounded-full bg-fg transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-xl font-semibold leading-snug tracking-tight text-fg sm:text-2xl">
          {question.question}
        </legend>

        <ul className="mt-6 space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selected === index;

            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => selectOption(index)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-lg border px-4 py-3.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-fg/40 bg-fg/10 text-fg"
                      : "border-border bg-panel text-fg-muted hover:border-fg/20 hover:text-fg"
                  }`}
                >
                  <span className="mr-3 font-mono text-xs text-fg-muted">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm text-fg-muted transition-colors hover:border-fg/30 hover:text-fg disabled:pointer-events-none disabled:opacity-40"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {currentIndex < QUIZ_QUESTIONS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={selected === null}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submitQuiz}
              disabled={!allAnswered}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
            >
              See results
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {QUIZ_QUESTIONS.map((q, index) => {
          const isActive = index === currentIndex;
          const isAnswered = answers[index] !== null;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to question ${index + 1}`}
              aria-current={isActive ? "step" : undefined}
              className={`h-2 w-2 rounded-full transition-colors ${
                isActive
                  ? "bg-fg"
                  : isAnswered
                    ? "bg-fg/40"
                    : "bg-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
