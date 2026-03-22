"use client";

import { useState } from "react";
import type { Scenario, ChoiceStep, Choice, ResolutionScenario } from "@/types/scenario";
import type { Answer } from "@/types/results";

export interface ScenarioPlayerState {
  stepIndex: number;
  answers: Answer[];
  score: number;
  totalScore: number;
  selectedResolution: ResolutionScenario | null;
  showResult: boolean;
  fadeIn: boolean;
}

export interface ScenarioPlayerActions {
  handleChoice: (choice: Choice, step: ChoiceStep) => void;
  goBack: () => void;
  goToStep: (idx: number) => void;
  handleResolution: (res: ResolutionScenario) => void;
  finishScenario: () => void;
}

export interface ScenarioPlayerComputed {
  currentStep: Scenario["steps"][number] | null;
  currentStepAnswer: Answer | null;
  currentStepChoice: Choice | null;
  prevChoice: Choice | null;
  position: string;
  getForwardRate: () => number;
  getHedgeRatio: () => number;
}

export type UseScenarioPlayerReturn = ScenarioPlayerState &
  ScenarioPlayerActions &
  ScenarioPlayerComputed;

export function useScenarioPlayer(
  currentScenario: Scenario,
  onFinish: (result: { id: string; score: number; totalScore: number }) => void
): UseScenarioPlayerReturn {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionScenario | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  const triggerFade = (fn: () => void) => {
    setFadeIn(false);
    setTimeout(() => {
      fn();
      setFadeIn(true);
    }, 250);
  };

  const handleChoice = (choice: Choice, step: ChoiceStep) => {
    // Check if this step was already answered (re-answering after going back)
    const existingIdx = answers.findIndex((a) => a.stepId === step.id);
    let newAnswers: Answer[];
    if (existingIdx >= 0) {
      // Replace this answer and remove all subsequent answers (they depend on this choice)
      newAnswers = [
        ...answers.slice(0, existingIdx),
        { stepId: step.id, choiceId: choice.id, correct: choice.correct, score: choice.score },
      ];
    } else {
      newAnswers = [
        ...answers,
        { stepId: step.id, choiceId: choice.id, correct: choice.correct, score: choice.score },
      ];
    }
    setAnswers(newAnswers);
    // Recalculate score from all answers
    const newScore = newAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
    const newTotal = newAnswers.reduce((sum, a) => {
      const s = currentScenario.steps.find((st) => st.id === a.stepId);
      if (!s || s.type !== "choice") return sum;
      return sum + Math.max(...s.choices.map((c) => c.score));
    }, 0);
    setScore(newScore);
    setTotalScore(newTotal);
    // Reset resolution if going back changed things
    setSelectedResolution(null);
    setShowResult(false);
    setTimeout(() => {
      triggerFade(() => {
        setStepIndex((i) => i + 1);
      });
    }, 100);
  };

  const goBack = () => {
    if (showResult) {
      // From result view, go back to resolution selection
      setSelectedResolution(null);
      setShowResult(false);
      return;
    }
    if (stepIndex > 0) {
      triggerFade(() => {
        setStepIndex((i) => i - 1);
      });
    }
  };

  const goToStep = (idx: number) => {
    // Can only go to steps that have been answered or the current step
    if (idx <= stepIndex) {
      if (showResult) {
        setSelectedResolution(null);
        setShowResult(false);
      }
      triggerFade(() => {
        setStepIndex(idx);
      });
    }
  };

  const handleResolution = (res: ResolutionScenario) => {
    setSelectedResolution(res);
    setShowResult(true);
  };

  const finishScenario = () => {
    onFinish({ id: currentScenario.id, score, totalScore });
    triggerFade(() => {
      setStepIndex(0);
      setAnswers([]);
      setScore(0);
      setTotalScore(0);
      setSelectedResolution(null);
      setShowResult(false);
    });
  };

  const currentStep = currentScenario?.steps[stepIndex] || null;

  // Find if the current step has a previously saved answer (for revisiting)
  const currentStepAnswer = currentStep
    ? answers.find((a) => a.stepId === currentStep.id) || null
    : null;
  const currentStepChoice =
    currentStepAnswer && currentStep?.type === "choice"
      ? currentStep.choices.find((c) => c.id === currentStepAnswer.choiceId) || null
      : null;

  // Find the feedback from the step just before (for the banner above current step)
  const prevStepIndex = stepIndex - 1;
  const prevStep = prevStepIndex >= 0 ? currentScenario?.steps[prevStepIndex] : null;
  const prevAnswer = prevStep ? answers.find((a) => a.stepId === prevStep.id) || null : null;
  const prevChoice =
    prevAnswer && prevStep?.type === "choice"
      ? prevStep.choices.find((c) => c.id === prevAnswer.choiceId) || null
      : null;

  const strategyAnswer = answers.find(
    (a) => a.choiceId === "sell_usd" || a.choiceId === "buy_usd"
  );
  const position = strategyAnswer?.choiceId || "sell_usd";

  const getForwardRate = (): number => {
    if (!currentScenario) return 5.28;
    const md = currentScenario.context.marketData;
    const cc = answers.find((a) =>
      [
        "market_fwd",
        "spot_rate",
        "above_fwd",
        "conservative",
        "moderate",
        "aggressive",
        "full_hedge",
        "partial_hedge",
        "no_hedge",
        "sintetico_completo",
        "apenas_ndf",
        "outro_ndf",
      ].includes(a.choiceId)
    )?.choiceId;
    if (cc === "spot_rate") return md.spotRate as number;
    if (cc === "above_fwd")
      return (md.forwardRate90d as number) + (md.forwardMercado ? 0 : 0.07);
    if (md.forwardMercado && currentScenario.themeId === "ndf")
      return md.forwardMercado as number;
    return md.forwardRate90d as number;
  };

  const getHedgeRatio = (): number => {
    const c = answers.find((a) =>
      ["full_hedge", "partial_hedge", "no_hedge"].includes(a.choiceId)
    )?.choiceId;
    if (c === "partial_hedge") return 0.5;
    if (c === "no_hedge") return 0;
    return 1.0;
  };

  return {
    stepIndex,
    answers,
    score,
    totalScore,
    selectedResolution,
    showResult,
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
  };
}
