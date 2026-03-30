// src/components/remotion/embutidos/layers/PayoffWaterfall.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  WATERFALL_VIEWBOX_H,
  BAR_WIDTH,
  AXIS_BASELINE_Y,
  BARS,
  COLOR_TEXT,
  COLOR_TEXT_DIM,
} from "../embutidos-data";

// ── Axis ───────────────────────────────────────────────────────────

const Axis: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <g opacity={opacity}>
      <line
        x1={40}
        y1={AXIS_BASELINE_Y}
        x2={370}
        y2={AXIS_BASELINE_Y}
        stroke={COLOR_TEXT_DIM}
        strokeWidth={1}
        opacity={0.4}
      />
      <text
        x={30}
        y={AXIS_BASELINE_Y + 20}
        fill={COLOR_TEXT_DIM}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.5}
      >
        Valor
      </text>
    </g>
  );
};

// ── Waterfall Bar ──────────────────────────────────────────────────

const WaterfallBar: React.FC<{
  x: number;
  height: number;
  yTop: number;
  color: string;
  label: string;
  value: string;
  delay: number;
  isNegative?: boolean;
}> = ({ x, height, yTop, color, label, value, delay, isNegative }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const growProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 180 },
  });

  // Bar grows from baseline upward (or downward for negative)
  const barHeight = height * growProgress;
  const barY = isNegative ? yTop : AXIS_BASELINE_Y - barHeight;

  // Value label pulse (after bar is grown)
  const labelOpacity = interpolate(
    frame,
    [delay + 20, delay + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const pulse = interpolate(
    frame % 90,
    [0, 45, 90],
    [0.6, 1, 0.6],
  );

  // Fade for loop reset
  const fadeTo = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g opacity={fadeTo}>
      {/* Bar fill */}
      <rect
        x={x}
        y={barY}
        width={BAR_WIDTH}
        height={barHeight}
        rx={4}
        fill={color}
        opacity={0.3}
      />
      {/* Bar outline */}
      <rect
        x={x}
        y={barY}
        width={BAR_WIDTH}
        height={barHeight}
        rx={4}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* Value label above bar */}
      <text
        x={x + BAR_WIDTH / 2}
        y={barY - 8}
        textAnchor="middle"
        fill={color}
        fontSize={14}
        fontFamily="monospace"
        fontWeight="bold"
        opacity={labelOpacity * pulse}
      >
        {value}
      </text>

      {/* Name label below baseline */}
      <text
        x={x + BAR_WIDTH / 2}
        y={AXIS_BASELINE_Y + 16}
        textAnchor="middle"
        fill={COLOR_TEXT}
        fontSize={10}
        fontFamily="monospace"
        opacity={growProgress * 0.5}
      >
        {label}
      </text>
    </g>
  );
};

// ── Main Component ─────────────────────────────────────────────────

export const PayoffWaterfall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Axis entrance synced with first bar
  const axisEntrance = spring({
    frame,
    fps,
    delay: 55,
    config: { damping: 200 },
  });

  const scale = 1.1;
  const svgOffsetX = 1920 * 0.68;
  const svgOffsetY = (800 - WATERFALL_VIEWBOX_H * scale) / 2 + 60;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}>
          <Axis opacity={axisEntrance} />

          {/* Bar 1: Principal Garantido (teal, grows up from baseline) */}
          <WaterfallBar
            x={BARS[0].x}
            height={BARS[0].height}
            yTop={BARS[0].yTop}
            color={BARS[0].color}
            label={BARS[0].label}
            value={BARS[0].value}
            delay={60}
          />

          {/* Bar 2: Custo de Oportunidade (red, grows down from top of bar 1) */}
          <WaterfallBar
            x={BARS[1].x}
            height={BARS[1].height}
            yTop={BARS[1].yTop}
            color={BARS[1].color}
            label={BARS[1].label}
            value={BARS[1].value}
            delay={80}
            isNegative
          />

          {/* Bar 3: Participação (gold, grows up) */}
          <WaterfallBar
            x={BARS[2].x}
            height={BARS[2].height}
            yTop={BARS[2].yTop}
            color={BARS[2].color}
            label={BARS[2].label}
            value={BARS[2].value}
            delay={100}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
