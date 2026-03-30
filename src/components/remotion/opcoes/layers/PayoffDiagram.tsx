// src/components/remotion/opcoes/layers/PayoffDiagram.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  VIEWBOX_W,
  VIEWBOX_H,
  AXIS_LEFT,
  AXIS_RIGHT,
  AXIS_TOP,
  AXIS_BOTTOM,
  ZERO_Y,
  STRIKE_X,
  CALL_POINTS,
  PUT_POINTS,
  CALL_BREAKEVEN,
  PUT_BREAKEVEN,
  COLOR_TEAL,
  COLOR_GOLD,
  COLOR_BULLISH,
  COLOR_BEARISH,
  pointsToString,
  polylineLength,
} from "../opcoes-data";
import type { Point } from "../opcoes-data";

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
      {/* X-axis (price) */}
      <line
        x1={AXIS_LEFT}
        y1={ZERO_Y}
        x2={AXIS_RIGHT}
        y2={ZERO_Y}
        stroke={COLOR_TEAL}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* Y-axis (P&L) */}
      <line
        x1={AXIS_LEFT}
        y1={AXIS_TOP}
        x2={AXIS_LEFT}
        y2={AXIS_BOTTOM}
        stroke={COLOR_TEAL}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* Axis labels */}
      <text
        x={AXIS_RIGHT + 8}
        y={ZERO_Y + 4}
        fill={COLOR_TEAL}
        fontSize={13}
        fontFamily="monospace"
        opacity={0.5}
      >
        S
      </text>
      <text
        x={AXIS_LEFT - 8}
        y={AXIS_TOP - 5}
        fill={COLOR_TEAL}
        fontSize={13}
        fontFamily="monospace"
        textAnchor="middle"
        opacity={0.5}
      >
        P&L
      </text>
    </g>
  );
};

// ── Strike Line ─────────────────────────────────────────────────────

const StrikeLine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay: 35,
    config: { damping: 200 },
  });

  return (
    <g opacity={progress * 0.3}>
      <line
        x1={STRIKE_X}
        y1={AXIS_TOP}
        x2={STRIKE_X}
        y2={AXIS_BOTTOM}
        stroke={COLOR_TEAL}
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      <text
        x={STRIKE_X}
        y={AXIS_BOTTOM + 16}
        fill={COLOR_TEAL}
        fontSize={12}
        fontFamily="monospace"
        textAnchor="middle"
        opacity={1}
      >
        K
      </text>
    </g>
  );
};

// ── Payoff Curve ────────────────────────────────────────────────────

const PayoffCurve: React.FC<{
  points: Point[];
  color: string;
  label: string;
  labelPos: Point;
  frameRange: [number, number];
}> = ({ points, color, label, labelPos, frameRange }) => {
  const frame = useCurrentFrame();

  const totalLen = polylineLength(points);

  const drawProgress = interpolate(frame, frameRange, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOffset = totalLen * (1 - drawProgress);

  return (
    <g>
      <polyline
        points={pointsToString(points)}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLen}
        strokeDashoffset={dashOffset}
      />
      {/* Curve label */}
      <text
        x={labelPos.x}
        y={labelPos.y}
        fill={color}
        fontSize={14}
        fontFamily="monospace"
        textAnchor="middle"
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

// ── Profit / Loss Zones ─────────────────────────────────────────────

const ProfitLossZones: React.FC = () => {
  const frame = useCurrentFrame();

  const zoneOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Call profit zone: triangle above zero line (from strike to right edge)
  const callProfitPoints = `${STRIKE_X},${ZERO_Y} ${AXIS_RIGHT},${CALL_POINTS[2].y} ${AXIS_RIGHT},${ZERO_Y}`;

  // Put profit zone: triangle above zero line (from left edge to strike)
  const putProfitPoints = `${AXIS_LEFT},${PUT_POINTS[0].y} ${STRIKE_X},${ZERO_Y} ${AXIS_LEFT},${ZERO_Y}`;

  // Call loss zone: rectangle below zero line (from left to strike)
  const callLossPoints = `${AXIS_LEFT},${ZERO_Y} ${STRIKE_X},${ZERO_Y} ${STRIKE_X},${CALL_POINTS[1].y} ${AXIS_LEFT},${CALL_POINTS[0].y}`;

  // Put loss zone: rectangle below zero line (from strike to right)
  const putLossPoints = `${STRIKE_X},${ZERO_Y} ${AXIS_RIGHT},${ZERO_Y} ${AXIS_RIGHT},${PUT_POINTS[2].y} ${STRIKE_X},${PUT_POINTS[1].y}`;

  return (
    <g opacity={zoneOpacity}>
      {/* Profit zones */}
      <polygon points={callProfitPoints} fill={COLOR_BULLISH} opacity={0.08} />
      <polygon points={putProfitPoints} fill={COLOR_BULLISH} opacity={0.08} />
      {/* Loss zones */}
      <polygon points={callLossPoints} fill={COLOR_BEARISH} opacity={0.06} />
      <polygon points={putLossPoints} fill={COLOR_BEARISH} opacity={0.06} />
    </g>
  );
};

// ── Break-Even Dots ─────────────────────────────────────────────────

const BreakEvenDot: React.FC<{ point: Point; delay: number }> = ({ point, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  // Subtle pulse
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.4, 1]);

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={4 * entrance * pulse}
      fill={COLOR_TEAL}
      opacity={entrance * 0.6}
    />
  );
};

// ── Main Component ──────────────────────────────────────────────────

export const PayoffDiagram: React.FC = () => {
  // Position the diagram in the right ~58% of the 1920×800 canvas
  const scale = 1.3;
  const svgOffsetX = 1920 * 0.40;
  const svgOffsetY = (800 - VIEWBOX_H * scale) / 2 - 20; // slightly above center

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
          <StrikeLine />
          <ProfitLossZones />

          {/* Call payoff curve */}
          <PayoffCurve
            points={CALL_POINTS}
            color={COLOR_TEAL}
            label="Call"
            labelPos={{ x: 460, y: CALL_POINTS[2].y - 10 }}
            frameRange={[40, 80]}
          />

          {/* Put payoff curve */}
          <PayoffCurve
            points={PUT_POINTS}
            color={COLOR_GOLD}
            label="Put"
            labelPos={{ x: 140, y: PUT_POINTS[0].y - 10 }}
            frameRange={[50, 90]}
          />

          {/* Break-even dots */}
          <BreakEvenDot point={CALL_BREAKEVEN} delay={75} />
          <BreakEvenDot point={PUT_BREAKEVEN} delay={78} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
