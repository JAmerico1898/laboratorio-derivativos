"use client";

import { calculateResult } from "@/lib/calculations/generic";
import { COLORS } from "@/lib/constants";
import { useScenarioPlayer } from "@/hooks/use-scenario-player";
import { ResultPanel } from "@/components/results/result-panel";
import { ScoreBar } from "./score-bar";
import { MarkdownText } from "@/components/shared/markdown-text";
import type { Scenario, Choice } from "@/types/scenario";
import type { CompletedScenario } from "@/types/results";

interface ScenarioPlayerProps {
  scenario: Scenario;
  onFinish: (result: CompletedScenario) => void;
  onBack: () => void;
}

export function ScenarioPlayer({ scenario, onFinish, onBack }: ScenarioPlayerProps) {
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
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          paddingTop: 24,
          paddingBottom: 48,
          transition: "opacity 0.3s",
          opacity: fadeIn ? 1 : 0,
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textMuted,
                padding: "6px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ← Início
            </button>
            {(stepIndex > 0 || showResult) && (
              <button
                onClick={goBack}
                style={{
                  background: "none",
                  border: `1px solid ${COLORS.accent}40`,
                  color: COLORS.accent,
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.accentDim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                ← Etapa anterior
              </button>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                color: COLORS.textDim,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Pontuação
            </div>
            <div style={{ width: 150 }}>
              <ScoreBar score={score} maxScore={maxPS} />
            </div>
          </div>
        </div>

        {/* ── Title + instrument badge ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{scenario.title}</h2>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: COLORS.accentDim,
              color: COLORS.accent,
            }}
          >
            {scenario.instrument}
          </span>
        </div>

        {/* ── Step progress bars ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {scenario.steps.map((s, i) => {
            const isCurrent = i === stepIndex;
            const canClick = i <= stepIndex;
            return (
              <div
                key={s.id}
                onClick={() => canClick && goToStep(i)}
                style={{
                  flex: 1,
                  height: canClick ? 6 : 4,
                  borderRadius: 3,
                  background:
                    i < stepIndex ? COLORS.accent : isCurrent ? COLORS.gold : COLORS.border,
                  transition: "all 0.3s",
                  cursor: canClick ? "pointer" : "default",
                  opacity: canClick ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (canClick) e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = canClick ? "1" : "0.5";
                }}
              />
            );
          })}
        </div>

        {/* ── Context panel ── */}
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 14,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.accent,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            Contexto
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            <MarkdownText text={scenario.context.narrative} />
          </p>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 8,
            }}
          >
            {(scenario.context.displayFields || []).map(([label, val]) => (
              <div
                key={label}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: COLORS.accentDim,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.accent,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedback banner from previous step ── */}
        {prevChoice && (
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 12,
              background: prevChoice.correct ? COLORS.greenDim : COLORS.redDim,
              border: `1px solid ${prevChoice.correct ? COLORS.green : COLORS.red}30`,
              marginBottom: 20,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: prevChoice.correct ? COLORS.green : COLORS.red,
              }}
            >
              {prevChoice.correct ? "✓ Correto" : "✗ Pode melhorar"} —{" "}
            </span>
            {prevChoice.feedback}
          </div>
        )}

        {/* ── Revisit banner ── */}
        {currentStepChoice && (
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              background: COLORS.cardHover,
              border: `1px dashed ${COLORS.accent}40`,
              marginBottom: 16,
              fontSize: 13,
              lineHeight: 1.6,
              color: COLORS.textMuted,
            }}
          >
            Resposta anterior:{" "}
            <strong style={{ color: COLORS.accent }}>{currentStepChoice.label}</strong> — você
            pode manter ou escolher outra opção.
          </div>
        )}

        {/* ── Choice step ── */}
        {currentStep?.type === "choice" && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {currentStep.prompt}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentStep.choices.map((ch) => {
                const wasSelected = currentStepAnswer?.choiceId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() =>
                      currentStep.type === "choice" && handleChoice(ch, currentStep)
                    }
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      background: wasSelected ? COLORS.accentDim : COLORS.card,
                      border: `1px solid ${wasSelected ? COLORS.accent : COLORS.border}`,
                      color: COLORS.text,
                      fontSize: 15,
                      fontWeight: 500,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      lineHeight: 1.5,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!wasSelected) {
                        e.currentTarget.style.background = COLORS.cardHover;
                        e.currentTarget.style.borderColor = COLORS.accent + "60";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!wasSelected) {
                        e.currentTarget.style.background = COLORS.card;
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    {wasSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 12,
                          fontSize: 11,
                          color: COLORS.accent,
                          fontWeight: 600,
                        }}
                      >
                        resposta atual
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
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {currentStep.prompt}
            </h3>
            <p style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 16 }}>
              Selecione um cenário de mercado:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentStep.scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleResolution(sc)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    lineHeight: 1.5,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.cardHover;
                    e.currentTarget.style.borderColor = COLORS.gold + "60";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = COLORS.card;
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{sc.label}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>{sc.description}</div>
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
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={goBack}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Testar outro cenário
              </button>
              <button
                onClick={finishScenario}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
                  border: "none",
                  color: COLORS.bg,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Finalizar e voltar →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
