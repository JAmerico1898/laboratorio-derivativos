"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { THEMES } from "@/data/themes";
import { ALL_SCENARIOS } from "@/data/scenarios";
import { getScenariosByTheme } from "@/data/scenarios";
import { useCompletedScenarios } from "@/hooks/use-completed-scenarios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocaleSwitcher } from "./locale-switcher";

export function DashboardPage() {
  const t = useTranslations("app");
  const { completedScenarios } = useCompletedScenarios();

  const totalScenarios = ALL_SCENARIOS.length;
  const uniqueCompleted = new Set(completedScenarios.map((cs) => cs.id)).size;

  function getModuleProgress(themeId: string) {
    const scenarios = getScenariosByTheme(themeId);
    const completedIds = new Set(completedScenarios.map((cs) => cs.id));
    const done = scenarios.filter((s) => completedIds.has(s.id)).length;
    return { completed: done, total: scenarios.length };
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LocaleSwitcher />

      <div className="mx-auto max-w-[900px] px-4 pt-12 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4">
            {t("badge")}
          </Badge>
          <h1 className="mb-3 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            {t("subtitle")}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("progressLine", { completed: uniqueCompleted, total: totalScenarios })}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const progress = getModuleProgress(theme.id);
            return (
              <Link key={theme.id} href={theme.route} className="block">
                <Card className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-primary">
                  <CardHeader>
                    <div className="text-3xl">{theme.icon}</div>
                    <CardTitle className="text-lg font-bold">
                      {theme.label}
                    </CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t("moduleProgress", {
                        completed: progress.completed,
                        total: progress.total,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer")}
        </div>
      </div>
    </div>
  );
}
