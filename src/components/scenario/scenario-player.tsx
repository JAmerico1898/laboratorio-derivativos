"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { calculateResult } from "@/lib/calculations/generic";
import { useScenarioPlayer } from "@/hooks/use-scenario-player";
import { ResultPanel } from "@/components/results/result-panel";
import { ScoreBar } from "./score-bar";
import { MarkdownText } from "@/components/shared/markdown-text";
import type { Scenario, Choice } from "@/types/scenario";
import type { CompletedScenario } from "@/types/results";

/**
 * Seeded pseudo-random shuffle so correct answer isn't always first.
 * Stable per step ID — same order on every render.
 */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const j = ((h >>> 0) % (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface ScenarioPlayerProps {
  scenario: Scenario;
  onFinish: (result: CompletedScenario) => void;
  onBack: () => void;
}

export function ScenarioPlayer({ scenario, onFinish, onBack }: ScenarioPlayerProps) {
  const t = useTranslations("app");
  const {
    stepIndex,
    score,
    showResult,
    selectedResolution,
    fadeIn,
    handleChoice,
    goBack,
    goToStep,
    handleResolution,
    finishScenario,
    currentStep,
    currentStepAnswer,
    currentStepChoice,
    prevChoice,
    position,
    getForwardRate,
    getHedgeRatio,
  } = useScenarioPlayer(scenario, onFinish);

  // Shuffle choices so the correct answer isn't always in the same position
  const shuffledChoices = useMemo(() => {
    if (currentStep?.type === "choice") {
      return seededShuffle(currentStep.choices, currentStep.id);
    }
    return [];
  }, [currentStep]);

  // Max possible score from choice steps
  const maxPS = scenario
    ? scenario.steps
        .filter((s) => s.type === "choice")
        .reduce((a, s) => {
          if (s.type !== "choice") return a;
          return a + Math.max(...s.choices.map((c: Choice) => c.score));
        }, 0)
    : 0;

  return (
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen px-4 relative overflow-hidden">
      {/* Decorative background gradient orbs */}
      <div className="fixed top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-150px] right-[-80px] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      <div
        className={`max-w-[720px] mx-auto pt-24 pb-12 transition-opacity duration-300 ${fadeIn ? "opacity-100" : "opacity-0"}`}
      >
        {/* ── Top bar ── */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="bg-transparent border border-outline-variant text-on-surface-variant px-3.5 py-1.5 rounded-lg cursor-pointer text-[13px]"
            >
              {t("backHome")}
            </button>
            {(stepIndex > 0 || showResult) && (
              <button
                onClick={goBack}
                className="bg-transparent border border-secondary/40 text-secondary px-3.5 py-1.5 rounded-lg cursor-pointer text-[13px] transition-all hover:bg-secondary/10"
              >
                {t("prevStep")}
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="text-[11px] text-outline uppercase tracking-wider">
              {t("score")}
            </div>
            <div className="w-[150px]">
              <ScoreBar score={score} maxScore={maxPS} />
            </div>
          </div>
        </div>

        {/* ── Title + instrument badge ── */}
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <h2 className="text-2xl font-extrabold m-0 font-heading">{scenario.title}</h2>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-secondary/10 text-secondary">
            {scenario.instrument}
          </span>
        </div>

        {/* ── Step progress bars ── */}
        <div className="flex gap-1 mb-6">
          {scenario.steps.map((s, i) => {
            const isCurrent = i === stepIndex;
            const canClick = i <= stepIndex;
            return (
              <div
                key={s.id}
                onClick={() => canClick && goToStep(i)}
                className={`flex-1 rounded-sm transition-all ${
                  canClick ? "h-1.5 cursor-pointer opacity-100 hover:opacity-70" : "h-1 cursor-default opacity-50"
                } ${
                  i < stepIndex
                    ? "bg-secondary"
                    : isCurrent
                      ? "bg-amber-500"
                      : "bg-surface-container-high"
                }`}
              />
            );
          })}
        </div>

        {/* ── Context panel ── */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">
            {t("context")}
          </div>
          <p className="text-[15px] leading-relaxed m-0">
            <MarkdownText text={scenario.context.narrative} />
          </p>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
            {(scenario.context.displayFields || []).map(([label, val]) => (
              <div
                key={label}
                className="rounded-lg bg-secondary/10 p-2 text-center"
              >
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {label}
                </div>
                <div className="text-sm font-bold text-secondary font-mono">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedback banner from previous step ── */}
        {prevChoice && (
          <div
            className={`px-5 py-3.5 rounded-xl mb-5 text-sm leading-relaxed ${
              prevChoice.correct
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <span
              className={`font-bold ${prevChoice.correct ? "text-emerald-600" : "text-red-600"}`}
            >
              {prevChoice.correct ? t("correct") : t("canImprove")} —{" "}
            </span>
            {prevChoice.feedback}
          </div>
        )}

        {/* ── Revisit banner ── */}
        {currentStepChoice && (
          <div className="bg-surface-container-low border border-dashed border-secondary/30 rounded-xl px-5 py-3 mb-4 text-[13px] leading-relaxed text-on-surface-variant">
            {t("prevAnswer")}:{" "}
            <strong className="text-secondary">{currentStepChoice.label}</strong> {t("keepOrChange")}
          </div>
        )}

        {/* ── Choice step ── */}
        {currentStep?.type === "choice" && (
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">{currentStep.prompt}</h3>
            <div className="flex flex-col gap-2.5">
              {shuffledChoices.map((ch) => {
                const wasSelected = currentStepAnswer?.choiceId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() =>
                      currentStep.type === "choice" && handleChoice(ch, currentStep)
                    }
                    className={`rounded-xl border p-4 text-left text-on-surface text-[15px] font-medium leading-normal cursor-pointer transition-all relative ${
                      wasSelected
                        ? "bg-secondary/10 border-secondary"
                        : "bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low hover:border-secondary/40 hover:translate-x-1"
                    }`}
                  >
                    {wasSelected && (
                      <span className="absolute top-2 right-3 text-[11px] text-secondary font-semibold">
                        {t("currentAnswer")}
                      </span>
                    )}
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Resolution step ── */}
        {currentStep?.type === "resolution" && !showResult && (
          <div>
            <h3 className="text-lg font-bold mb-2 font-heading">{currentStep.prompt}</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              {t("selectScenario")}
            </p>
            <div className="flex flex-col gap-2.5">
              {currentStep.scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleResolution(sc)}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left text-on-surface text-[15px] font-medium leading-normal cursor-pointer transition-all hover:bg-surface-container-low hover:border-amber-500/40 hover:translate-x-1"
                >
                  <div className="font-bold mb-1">{sc.label}</div>
                  <div className="text-[13px] text-on-surface-variant">{sc.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Result view ── */}
        {showResult && selectedResolution && (
          <div>
            <ResultPanel
              result={calculateResult(
                scenario.context.marketData,
                getForwardRate(),
                selectedResolution.fixingRate,
                position as "sell_usd" | "buy_usd",
                getHedgeRatio()
              )}
              scenario={selectedResolution}
              position={position}
              forwardChosen={getForwardRate()}
              instrument={scenario.instrument}
              scenarioData={scenario}
            />
            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={goBack}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-3 text-on-surface text-sm font-semibold cursor-pointer transition-all hover:bg-surface-container-low"
              >
                {t("tryAnother")}
              </button>
              <button
                onClick={finishScenario}
                className="bg-primary text-on-primary rounded-xl px-6 py-3 border-none text-sm font-bold cursor-pointer transition-all hover:opacity-90"
              >
                {t("finishReturn")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
