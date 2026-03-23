interface ScoreBarProps {
  score: number;
  maxScore: number;
}

export function ScoreBar({ score, maxScore }: ScoreBarProps) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-gradient-to-r from-secondary to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="min-w-[60px] text-right font-mono text-sm font-bold text-amber-600">
        {score} / {maxScore}
      </span>
    </div>
  );
}
