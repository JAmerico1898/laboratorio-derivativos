import { COLORS } from "@/lib/constants";

interface ScoreBarProps {
  score: number;
  maxScore: number;
}

export function ScoreBar({ score, maxScore }: ScoreBarProps) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: COLORS.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.green})`,
            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <span
        style={{
          color: COLORS.gold,
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minWidth: 60,
          textAlign: "right",
        }}
      >
        {score} / {maxScore}
      </span>
    </div>
  );
}
