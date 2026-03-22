import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/formatters";

interface FixingDotProps {
  cx?: number;
  cy?: number;
  payload?: { fixing: number };
  fixingRate?: number;
  fixingPnL?: number;
  tolerance?: number;
  overridePnL?: number;
  index?: number;
}

export function FixingDot({
  cx,
  cy,
  payload,
  fixingRate,
  fixingPnL,
  tolerance,
  overridePnL,
}: FixingDotProps) {
  if (
    !fixingRate ||
    !payload ||
    cx === undefined ||
    cy === undefined ||
    Math.abs(payload.fixing - fixingRate) > (tolerance || 0.02)
  )
    return null;

  const displayPnL = overridePnL !== undefined ? overridePnL : fixingPnL ?? 0;
  const isProfit = displayPnL >= 0;
  const color = isProfit ? COLORS.green : COLORS.red;

  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.15}>
        <animate attributeName="r" from="10" to="18" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.2} />
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />
      <rect
        x={cx - 70}
        y={cy - 38}
        width={140}
        height={24}
        rx={6}
        fill={COLORS.card}
        stroke={color}
        strokeWidth={1}
        opacity={0.95}
      />
      <text
        x={cx}
        y={cy - 22}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontWeight="bold"
        fontFamily="'JetBrains Mono', monospace"
      >
        {isProfit ? "+" : ""}
        {fmt(displayPnL)}
      </text>
    </g>
  );
}
