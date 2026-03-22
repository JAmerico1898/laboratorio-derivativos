"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { COLORS } from '@/lib/constants';
import { THEMES } from '@/data/themes';
import { getScenariosByTheme } from '@/data/scenarios';
import { useCompletedScenarios } from '@/hooks/use-completed-scenarios';
import { ScenarioPlayer } from '@/components/scenario/scenario-player';
import { useRouter } from '@/i18n/navigation';
import type { Scenario } from '@/types/scenario';
import type { CompletedScenario } from '@/types/results';

interface ModulePageProps {
  themeId: string;
}

function getDifficultyBadgeStyle(difficulty: string): React.CSSProperties {
  if (difficulty === 'Super Desafio') {
    return {
      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      color: '#e9d5ff',
    };
  }
  if (difficulty === 'Avançado') {
    return {
      background: COLORS.redDim,
      color: COLORS.red,
    };
  }
  return {
    background: COLORS.goldDim,
    color: COLORS.gold,
  };
}

export function ModulePage({ themeId }: ModulePageProps) {
  const t = useTranslations('app');
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const { completedScenarios, addCompletedScenario } = useCompletedScenarios();

  const theme = THEMES.find((th) => th.id === themeId);
  const scenarios = getScenariosByTheme(themeId);

  const getCompletionForScenario = (scenarioId: string): CompletedScenario | undefined => {
    return [...completedScenarios].reverse().find((cs) => cs.id === scenarioId);
  };

  const handleFinish = (result: CompletedScenario) => {
    addCompletedScenario(result);
    setActiveScenario(null);
  };

  const handleBack = () => {
    setActiveScenario(null);
  };

  if (activeScenario) {
    return (
      <ScenarioPlayer
        scenario={activeScenario}
        onFinish={handleFinish}
        onBack={handleBack}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.bg} 0%, #111827 100%)`,
        color: COLORS.text,
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        padding: '0 16px',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          paddingTop: 32,
          paddingBottom: 64,
        }}
      >
        {/* Back button */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.textMuted,
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {t('backHome')}
          </button>
        </div>

        {/* Theme header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-block',
              background: COLORS.accentDim,
              color: COLORS.accent,
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            {theme?.icon} {theme?.label}
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {theme?.label}
          </h1>
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenarios.map((scenario) => {
            const completion = getCompletionForScenario(scenario.id);
            const isCompleted = !!completion;
            const diffStyle = getDifficultyBadgeStyle(scenario.difficulty);

            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.cardHover;
                  e.currentTarget.style.borderColor = `${COLORS.accent}60`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = COLORS.card;
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, flex: 1 }}>
                    {scenario.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    {isCompleted && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: COLORS.greenDim,
                          color: COLORS.green,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✓ {completion.score}/{completion.totalScore}
                      </span>
                    )}
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        ...diffStyle,
                      }}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: COLORS.textMuted,
                    margin: 0,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {scenario.context.narrative.replace(/\*\*/g, '')}
                </p>

                <div style={{ marginTop: 10 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 5,
                      fontSize: 10,
                      fontWeight: 600,
                      background: COLORS.accentDim,
                      color: COLORS.accent,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {scenario.instrument}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
