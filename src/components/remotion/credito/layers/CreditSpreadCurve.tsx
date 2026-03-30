// src/components/remotion/credito/layers/CreditSpreadCurve.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  VIEWBOX_H,
  AXIS_LEFT,
  AXIS_RIGHT,
  AXIS_TOP,
  AXIS_BOTTOM,
  MATURITIES,
  RISK_FREE_CURVE,
  CORPORATE_CURVE,
  SPREAD_X,
  SPREAD_Y_TOP,
  SPREAD_Y_BOTTOM,
  COLOR_TEAL,
  COLOR_GOLD,
  smoothCurvePath,
  approximatePathLength,
} from "../credito-data";
import type { Point } from "../credito-data";

// ── Axes ────────────────────────────────────────────────────────────

const Axes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });

  return (
    <g opacity={progress}>
      {/* X-axis (maturity) */}
      <line
        x1={AXIS_LEFT}
        y1={AXIS_BOTTOM}
        x2={AXIS_RIGHT}
        y2={AXIS_BOTTOM}
        stroke={COLOR_TEAL}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* Y-axis (yield) */}
      <line
        x1={AXIS_LEFT}
        y1={AXIS_TOP}
        x2={AXIS_LEFT}
        y2={AXIS_BOTTOM}
        stroke={COLOR_TEAL}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* Y-axis label */}
      <text
        x={AXIS_LEFT - 8}
        y={AXIS_TOP - 5}
        fill={COLOR_TEAL}
        fontSize={13}
        fontFamily="monospace"
        textAnchor="middle"
        opacity={0.5}
      >
        Yield
      </text>
    </g>
  );
};

// ── Maturity Labels ─────────────────────────────────────────────────

const MaturityLabels: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay: 35,
    config: { damping: 200 },
  });

  const spacing = (AXIS_RIGHT - AXIS_LEFT) / (MATURITIES.length - 1);

  return (
    <g opacity={progress}>
      {MATURITIES.map((label, i) => {
        // Skip "2Y" and "7Y" — they overlap with CDSFlow circles
        if (label === "2Y" || label === "7Y") return null;
        return (
          <text
            key={label}
            x={AXIS_LEFT + i * spacing}
            y={AXIS_BOTTOM + 18}
            fill={COLOR_TEAL}
            fontSize={11}
            fontFamily="monospace"
            textAnchor="middle"
            opacity={0.5}
          >
            {label}
          </text>
        );
      })}
    </g>
  );
};

// ── Yield Curve ─────────────────────────────────────────────────────

const YieldCurve: React.FC<{
  points: Point[];
  color: string;
  label: string;
  frameRange: [number, number];
}> = ({ points, color, label, frameRange }) => {
  const frame = useCurrentFrame();

  const pathD = smoothCurvePath(points);
  const totalLen = approximatePathLength(points);

  const drawProgress = interpolate(frame, frameRange, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOffset = totalLen * (1 - drawProgress);

  // Label at end of curve
  const lastPoint = points[points.length - 1];

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLen}
        strokeDashoffset={dashOffset}
      />
      <text
        x={lastPoint.x + 8}
        y={lastPoint.y + 4}
        fill={color}
        fontSize={12}
        fontFamily="monospace"
        opacity={interpolate(frame, [frameRange[1] - 5, frameRange[1] + 10], [0, 0.7], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      >
        {label}
      </text>
    </g>
  );
};

// ── Spread Fill (area between curves) ───────────────────────────────

const SpreadFill: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Build a closed polygon: corporate curve forward, then risk-free curve backward
  const forwardPoints = CORPORATE_CURVE.map((p) => `${p.x},${p.y}`).join(" ");
  const backwardPoints = [...RISK_FREE_CURVE].reverse().map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id="spread-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR_GOLD} stopOpacity={0.12} />
          <stop offset="100%" stopColor={COLOR_TEAL} stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <polygon
        points={`${forwardPoints} ${backwardPoints}`}
        fill="url(#spread-gradient)"
      />
    </g>
  );
};

// ── Spread Indicator (pulsing arrow at 5Y) ──────────────────────────

const SpreadIndicator: React.FC = () => {
  const frame = useCurrentFrame();

  const entrance = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse opacity on 90-frame cycle
  const pulse = interpolate(frame % 90, [0, 45, 90], [0.3, 0.7, 0.3]);

  return (
    <g opacity={entrance}>
      {/* Vertical line between curves */}
      <line
        x1={SPREAD_X}
        y1={SPREAD_Y_TOP}
        x2={SPREAD_X}
        y2={SPREAD_Y_BOTTOM}
        stroke={COLOR_TEAL}
        strokeWidth={1.5}
        strokeDasharray="3,3"
        opacity={pulse}
      />
      {/* Top arrowhead */}
      <polygon
        points={`${SPREAD_X},${SPREAD_Y_TOP} ${SPREAD_X - 4},${SPREAD_Y_TOP + 8} ${SPREAD_X + 4},${SPREAD_Y_TOP + 8}`}
        fill={COLOR_TEAL}
        opacity={pulse}
      />
      {/* Bottom arrowhead */}
      <polygon
        points={`${SPREAD_X},${SPREAD_Y_BOTTOM} ${SPREAD_X - 4},${SPREAD_Y_BOTTOM - 8} ${SPREAD_X + 4},${SPREAD_Y_BOTTOM - 8}`}
        fill={COLOR_TEAL}
        opacity={pulse}
      />
      {/* Label */}
      <text
        x={SPREAD_X + 12}
        y={(SPREAD_Y_TOP + SPREAD_Y_BOTTOM) / 2 + 4}
        fill={COLOR_TEAL}
        fontSize={12}
        fontFamily="monospace"
        opacity={pulse * 0.8}
      >
        Credit Spread
      </text>
    </g>
  );
};

// ── Main Component ──────────────────────────────────────────────────

export const CreditSpreadCurve: React.FC = () => {
  const scale = 1.3;
  const svgOffsetX = 1920 * 0.40;
  const svgOffsetY = (800 - VIEWBOX_H * scale) / 2 - 60; // upper portion

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}>
          <Axes />
          <MaturityLabels />
          <SpreadFill />

          {/* Risk-free yield curve */}
          <YieldCurve
            points={RISK_FREE_CURVE}
            color={COLOR_TEAL}
            label="Risk-Free"
            frameRange={[40, 80]}
          />

          {/* Corporate yield curve */}
          <YieldCurve
            points={CORPORATE_CURVE}
            color={COLOR_GOLD}
            label="Corporate"
            frameRange={[50, 90]}
          />

          <SpreadIndicator />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
