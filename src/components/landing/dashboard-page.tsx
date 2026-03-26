"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { THEMES } from "@/data/themes";
import { getScenariosByTheme } from "@/data/scenarios";
import { useCompletedScenarios } from "@/hooks/use-completed-scenarios";

export function DashboardPage() {
  const t = useTranslations("app");
  const { completedScenarios } = useCompletedScenarios();

  function getModuleProgress(themeId: string) {
    const scenarios = getScenariosByTheme(themeId);
    const completedIds = new Set(completedScenarios.map((cs) => cs.id));
    const done = scenarios.filter((s) => completedIds.has(s.id)).length;
    return { completed: done, total: scenarios.length };
  }

  return (
    <div className="bg-background text-on-background font-sans antialiased">
      {/* ── Hero Section ── */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/10 to-transparent opacity-50" />
        </div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl font-heading font-extrabold text-primary leading-[1.1] tracking-tight">
              {t("heroTitle")}{" "}
              <span className="text-secondary">{t("heroTitleAccent")}</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-secondary/10 rounded-3xl blur-3xl" />
            <img
              alt="Modern stock exchange trading floor with multiple screens"
              className="relative z-10 w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl"
              src="/hero-trading.jpg"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works / Methodology Section ── */}
      <section id="methodology" className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-heading font-bold text-primary">
              {t("methodologyTitle")}
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
                <h3 className="text-xl font-bold text-primary">{t("methodStep1Title")}</h3>
                <p className="text-on-surface-variant">{t("methodStep1Text")}</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-8 space-y-6">
              <div className="w-16 h-16 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">account_tree</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{t("methodStep2Title")}</h3>
                <p className="text-on-surface-variant">{t("methodStep2Text")}</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-8 space-y-6">
              <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">{t("methodStep3Title")}</h3>
                <p className="text-on-surface-variant">{t("methodStep3Text")}</p>
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
                {t("modulesTitle")}
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
                          {t("progressLabel")}
                        </span>
                        <span className="text-xs font-bold text-secondary">
                          {t("moduleProgress", {
                            completed: progress.completed,
                            total: progress.total,
                          })}
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

      {/* ── Footer ── */}
      <footer className="w-full py-12 border-t border-white/10 bg-primary">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-xl font-heading font-bold text-white">{t("siteTitle")}</div>
            <div className="text-sm text-slate-300">{t("footerCopyright1")}</div>
            <div className="text-sm text-slate-300">{t("footerCopyright2")}</div>
          </div>
          <Link href="/contato" className="text-lg font-semibold text-slate-200 hover:text-emerald-400 transition-colors underline decoration-emerald-500/50 underline-offset-4">
            {t("footerContact")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
