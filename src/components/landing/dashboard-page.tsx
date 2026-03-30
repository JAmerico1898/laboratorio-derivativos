"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { strings, moduleProgress } from "@/lib/strings";
import { THEMES } from "@/data/themes";
import { getScenariosByTheme } from "@/data/scenarios";
import { useCompletedScenarios } from "@/hooks/use-completed-scenarios";

const HeroPlayer = dynamic(
  () => import("@/components/remotion/HeroPlayer").then((m) => ({ default: m.HeroPlayer })),
  { ssr: false }
);

export function DashboardPage() {
  const { completedScenarios } = useCompletedScenarios();

  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // On mobile (no animation), show text immediately
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      setShowText(true);
      return;
    }
    const timer = setTimeout(() => setShowText(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  function getModuleProgress(themeId: string) {
    const scenarios = getScenariosByTheme(themeId);
    const completedIds = new Set(completedScenarios.map((cs) => cs.id));
    const done = scenarios.filter((s) => completedIds.has(s.id)).length;
    return { completed: done, total: scenarios.length };
  }

  return (
    <div className="bg-background text-on-background font-sans antialiased">
      {/* ── Hero Section ── */}
      <section className="relative w-screen -ml-[calc((100vw-100%)/2)] min-h-[600px] lg:min-h-[700px] overflow-hidden bg-[#0a1628]">
        {/* Animation layer — desktop only */}
        <div className="absolute inset-0 hidden lg:block">
          <HeroPlayer />
        </div>

        {/* Gradient mask — dims animation under text */}
        <div
          className="absolute inset-0 z-[5] hidden lg:block pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #0a1628 0%, #0a1628 20%, rgba(10,22,40,0.85) 30%, transparent 50%)",
          }}
        />

        {/* Mobile gradient background */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)",
          }}
        />

        {/* Text content */}
        <div className="relative z-10 flex items-center min-h-[600px] lg:min-h-[700px] px-8 lg:px-16">
          <div
            className="max-w-xl space-y-8 lg:w-[35%]"
            style={{
              opacity: showText ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#e8eaed] leading-[1.1] tracking-tight">
              {strings.heroTitle}{" "}
              <span className="text-[#8df5e4]">{strings.heroTitleAccent}</span>
            </h1>
            <p className="text-lg lg:text-xl text-[rgba(232,234,237,0.55)] max-w-xl leading-relaxed">
              {strings.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works / Methodology Section ── */}
      <section id="methodology" className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-heading font-bold text-primary">
              {strings.methodologyTitle}
            </h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-8 space-y-6">
              <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">topic</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{strings.methodStep1Title}</h3>
                <p className="text-on-surface-variant">{strings.methodStep1Text}</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-8 space-y-6">
              <div className="w-16 h-16 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">account_tree</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{strings.methodStep2Title}</h3>
                <p className="text-on-surface-variant">{strings.methodStep2Text}</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-8 space-y-6">
              <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{strings.methodStep3Title}</h3>
                <p className="text-on-surface-variant">{strings.methodStep3Text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modules Grid Section ── */}
      <section id="modules" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <div className="space-y-2">
              <h2 className="text-4xl font-heading font-bold text-primary tracking-tight">
                {strings.modulesTitle}
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {THEMES.map((theme) => {
              const progress = getModuleProgress(theme.id);
              const pct = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

              return (
                <Link key={theme.id} href={theme.route} className="block">
                  <div className="group cursor-pointer bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_rgba(25,28,29,0.06)] transition-all duration-300 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                        <span className="material-symbols-outlined">
                          {theme.materialIcon}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-primary">{theme.label}</h3>
                      <p className="text-on-surface-variant leading-relaxed text-sm">
                        {theme.description}
                      </p>
                    </div>
                    <div className="mt-8 relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {strings.progressLabel}
                        </span>
                        <span className="text-xs font-bold text-secondary">
                          {moduleProgress(progress.completed, progress.total)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary-fixed-dim h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
