"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { COLORS } from '@/lib/constants';
import { THEMES } from '@/data/themes';
import { getScenariosByTheme } from '@/data/scenarios';
import { useCompletedScenarios } from '@/hooks/use-completed-scenarios';
import { ScenarioPlayer } from '@/components/scenario/scenario-player';
import { ScoreBar } from '@/components/scenario/score-bar';
import { LocaleSwitcher } from './locale-switcher';
import type { Scenario } from '@/types/scenario';
import type { CompletedScenario } from '@/types/results';

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

export function LandingPage() {
  const t = useTranslations('app');
  const [activeTheme, setActiveTheme] = useState(THEMES[0].id);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const { completedScenarios, addCompletedScenario } = useCompletedScenarios();

  const scenariosForTheme = getScenariosByTheme(activeTheme);

  // Cumulative score across ALL completed scenarios
  const totalScore = completedScenarios.reduce((sum, cs) => sum + cs.score, 0);
  const totalMaxScore = completedScenarios.reduce((sum, cs) => sum + cs.totalScore, 0);

  const getCompletionForScenario = (scenarioId: string): CompletedScenario | undefined => {
    // Return the last completion for this scenario
    return [...completedScenarios].reverse().find((cs) => cs.id === scenarioId);
  };

  const handleFinish = (result: CompletedScenario) => {
    addCompletedScenario(result);
    setActiveScenario(null);
  };

  const handleBack = () => {
    setActiveScenario(null);
  };

  // If a scenario is active, show the player full-screen
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
      <LocaleSwitcher />

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          paddingTop: 48,
          paddingBottom: 64,
        }}
      >
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* Badge */}
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
              marginBottom: 16,
            }}
          >
            {t('badge')}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(32px, 8vw, 52px)',
              fontWeight: 900,
              margin: '0 0 12px',
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
            }}
          >
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 16,
              color: COLORS.textMuted,
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 500,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* ── Theme Tabs ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 28,
          }}
        >
          {THEMES.map((theme) => {
            const isActive = theme.id === activeTheme;
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: isActive ? COLORS.accentDim : 'transparent',
                  border: `1px solid ${isActive ? COLORS.accent : COLORS.border}`,
                  color: isActive ? COLORS.accent : COLORS.textMuted,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = COLORS.card;
                    e.currentTarget.style.borderColor = `${COLORS.accent}60`;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.color = COLORS.textMuted;
                  }
                }}
              >
                <span>{theme.icon}</span>
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Scenario Cards ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {scenariosForTheme.map((scenario) => {
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
                {/* Card top row */}
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

                {/* Narrative preview */}
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

                {/* Instrument badge */}
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

        {/* ── Cumulative Score ── */}
        {completedScenarios.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 14,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: COLORS.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              {t('cumulativeScore')} ({completedScenarios.length} cenário
              {completedScenarios.length !== 1 ? 's' : ''})
            </div>
            <ScoreBar score={totalScore} maxScore={totalMaxScore} />
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: COLORS.textDim,
            paddingTop: 16,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          {t('footer')}
        </div>
      </div>
    </div>
  );
}
