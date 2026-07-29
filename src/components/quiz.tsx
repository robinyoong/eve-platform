"use client";

import { useCallback, useMemo, useState } from "react";
import {
  QUIZ_QUESTIONS,
  getScoreLabel,
  scoreQuiz,
  type QuizQuestion,
} from "@/lib/quiz";

type QuizPhase = "active" | "results";

function OptionButton({
  option,
  questionId,
  selectedOptionId,
  revealed,
  correctOptionId,
  onSelect,
}: {
  option: QuizQuestion["options"][number];
  questionId: string;
  selectedOptionId: string | undefined;
  revealed: boolean;
  correctOptionId: string;
  onSelect: (questionId: string, optionId: string) => void;
}) {
  const isSelected = selectedOptionId === option.id;
  const isCorrect = option.id === correctOptionId;

  let className =
    "w-full rounded-lg border px-4 py-3 text-left text-sm leading-6 transition-colors ";

  if (revealed) {
    if (isCorrect) {
      className += "border-emerald-500/60 bg-emerald-500/10 text-fg";
    } else if (isSelected) {
      className += "border-red-500/60 bg-red-500/10 text-fg";
    } else {
      className += "border-border bg-panel/40 text-fg-muted";
    }
  } else if (isSelected) {
    className += "border-fg/40 bg-panel text-fg";
  } else {
    className +=
      "border-border bg-panel/60 text-fg hover:border-fg/30 hover:bg-panel";
  }

  return (
    <button
      type="button"
      disabled={revealed}
      onClick={() => onSelect(questionId, option.id)}
      className={className}
      aria-pressed={isSelected}
    >
      <span className="font-mono text-xs text-fg-muted uppercase">
        {option.id}.
      </span>{" "}
      {option.label}
    </button>
  );
}

export function Quiz() {
  const [phase, setPhase] = useState<QuizPhase>("active");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const score = useMemo(
    () => (phase === "results" ? scoreQuiz(answers) : null),
    [answers, phase],
  );

  const handleSelect = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    }
  };

  const handleSubmit = () => {
    if (allAnswered) {
      setPhase("results");
    }
  };

  const handleRetry = () => {
    setPhase("active");
    setCurrentIndex(0);
    setAnswers({});
  };

  if (phase === "results" && score) {
    return (
      <div className="animate-fade-up space-y-10">
        <div className="rounded-xl border border-border bg-panel p-8 text-center">
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Final score
          </p>
          <p className="mt-3 font-mono text-6xl font-medium tracking-tight text-fg">
            {score.correct}/{score.total}
          </p>
          <p className="mt-2 text-2xl font-semibold text-fg">
            {score.percentage}%
          </p>
          <p className="mt-3 text-base text-fg-muted">
            {getScoreLabel(score.percentage)}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-fg">Review</h2>
          {score.results.map(({ question, selectedOptionId, isCorrect }, index) => (
            <article
              key={question.id}
              className="rounded-xl border border-border bg-panel/60 p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-fg-muted">
                  Q{index + 1}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isCorrect
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <p className="mt-3 text-base leading-7 text-fg">{question.prompt}</p>
              <ul className="mt-4 space-y-2">
                {question.options.map((option) => (
                  <li key={option.id}>
                    <OptionButton
                      option={option}
                      questionId={question.id}
                      selectedOptionId={selectedOptionId}
                      revealed
                      correctOptionId={question.correctOptionId}
                      onSelect={handleSelect}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-6 text-fg-muted">
                {question.explanation}
              </p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {answeredCount} answered
          </p>
        </div>
        <div
          className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-border sm:w-48"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={QUIZ_QUESTIONS.length}
        >
          <div
            className="h-full rounded-full bg-fg transition-all duration-300"
            style={{
              width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <article className="rounded-xl border border-border bg-panel/60 p-6 sm:p-8">
        <p className="text-lg leading-8 text-fg sm:text-xl">
          {currentQuestion.prompt}
        </p>
        <ul className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => (
            <li key={option.id}>
              <OptionButton
                option={option}
                questionId={currentQuestion.id}
                selectedOptionId={answers[currentQuestion.id]}
                revealed={false}
                correctOptionId={currentQuestion.correctOptionId}
                onSelect={handleSelect}
              />
            </li>
          ))}
        </ul>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-fg transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <div className="flex flex-wrap gap-2">
          {QUIZ_QUESTIONS.map((question, index) => {
            const isAnswered = Boolean(answers[question.id]);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to question ${index + 1}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-btn text-btn-fg"
                    : isAnswered
                      ? "border border-fg/30 bg-panel text-fg"
                      : "border border-border text-fg-muted hover:border-fg/20"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {currentIndex < QUIZ_QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-10 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex h-10 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            See score
          </button>
        )}
      </div>

      {!allAnswered && currentIndex === QUIZ_QUESTIONS.length - 1 && (
        <p className="text-center text-sm text-fg-muted">
          Answer every question to submit — use the numbered buttons to jump
          back to any you skipped.
        </p>
      )}
    </div>
  );
}
