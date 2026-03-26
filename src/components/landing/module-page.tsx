"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

function getDifficultyStyles(difficulty: string) {
  if (difficulty === 'Super Desafio') {
    return {
      card: 'bg-tertiary-container text-white shadow-lg shadow-tertiary-container/20 hover:shadow-xl',
      badge: 'bg-tertiary-fixed text-on-tertiary-fixed',
      title: 'text-tertiary-fixed',
      narrative: 'text-on-primary-container opacity-90',
      cta: 'text-tertiary-fixed-dim',
    };
  }
  if (difficulty === 'Avançado') {
    return {
      card: 'bg-surface-container-highest shadow-sm hover:shadow-md',
      badge: 'bg-primary text-white',
      title: 'text-primary',
      narrative: 'text-on-surface-variant',
      cta: 'text-primary',
    };
  }
  // Intermediário (default)
  return {
    card: 'bg-surface-container-lowest shadow-sm hover:shadow-md',
    badge: 'bg-secondary-container text-on-secondary-container',
    title: 'text-primary',
    narrative: 'text-on-surface-variant',
    cta: 'bg-primary text-on-primary hover:bg-primary-container',
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
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen">
      {/* Visual Polish: Background Gradients */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 relative">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-primary font-semibold hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="uppercase tracking-widest text-xs">{t('backToModules')}</span>
            </button>
          </div>
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-primary mb-4 leading-none">
              {theme?.label}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {theme?.description}
            </p>
          </div>
        </header>

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const completion = getCompletionForScenario(scenario.id);
            const isCompleted = !!completion;
            const styles = getDifficultyStyles(scenario.difficulty);
            const isSuperDesafio = scenario.difficulty === 'Super Desafio';
            const isIntermediario = scenario.difficulty === 'Intermediário';

            return (
              <div
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                className={`rounded-xl p-8 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer ${styles.card}`}
              >
                {/* Decorative orb */}
                {!isSuperDesafio && (
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {scenario.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {completion.score}/{completion.totalScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className={`font-heading text-2xl font-bold mb-4 ${styles.title}`}>
                    {scenario.title}
                  </h3>
                  <p className={`leading-relaxed ${styles.narrative}`}>
                    {scenario.context.narrative.replace(/\*\*/g, '')}
                  </p>
                </div>

                {isIntermediario ? (
                  <button className={`mt-8 w-fit px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors active:scale-95 cursor-pointer ${styles.cta}`}>
                    {t('startScenario')}
                    <span className="material-symbols-outlined text-sm">trending_flat</span>
                  </button>
                ) : (
                  <div className={`mt-8 flex items-center justify-between font-bold text-sm group-hover:translate-x-1 transition-transform cursor-pointer ${styles.cta}`}>
                    <span>{t('startScenario')}</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
