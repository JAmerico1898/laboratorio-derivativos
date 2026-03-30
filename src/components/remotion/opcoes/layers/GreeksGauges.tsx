// src/components/remotion/opcoes/layers/GreeksGauges.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  GREEKS,
  GAUGE_ROW_Y,
  GAUGE_SPACING,
  GAUGE_START_X,
  COLOR_TEAL,
  COLOR_GOLD,
} from "../opcoes-data";

const GAUGE_R = 24; // radius of the semi-circular arc

// ── Delta Gauge: arc + sweeping needle ──────────────────────────────

const DeltaGauge: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay, config: { damping: 20, stiffness: 180 } });

  // Needle sweeps from 0 → 0.65 (mapped to angle: -180° → 0° range, so 0.65 = -63°)
  const needleAngle = interpolate(entrance, [0, 1], [-180, -180 + 0.65 * 180]);

  // Arc path (semi-circle, left half = 0, right half = 1)
  const arcPath = `M ${cx - GAUGE_R} ${cy} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${cx + GAUGE_R} ${cy}`;

  return (
    <g opacity={entrance}>
      {/* Background arc */}
      <path d={arcPath} fill="none" stroke={COLOR_TEAL} strokeWidth={1.5} opacity={0.2} />
      {/* Filled arc to current value */}
      <path
        d={arcPath}
        fill="none"
        stroke={COLOR_TEAL}
        strokeWidth={2}
        opacity={0.6}
        strokeDasharray={Math.PI * GAUGE_R}
        strokeDashoffset={Math.PI * GAUGE_R * (1 - 0.65 * entrance)}
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + GAUGE_R * 0.8 * Math.cos((needleAngle * Math.PI) / 180)}
        y2={cy + GAUGE_R * 0.8 * Math.sin((needleAngle * Math.PI) / 180)}
        stroke={COLOR_TEAL}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill={COLOR_TEAL} />
    </g>
  );
};

// ── Gamma Gauge: bell curve that pulses ─────────────────────────────

const GammaGauge: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay, config: { damping: 20, stiffness: 180 } });

  // Pulse scale on 90-frame cycle
  const pulse = interpolate(frame % 90, [0, 45, 90], [1, 1.15, 1]);

  // Bell curve path (simplified gaussian)
  const w = GAUGE_R * 2;
  const h = GAUGE_R;
  const bellPath = `M ${cx - w / 2} ${cy} Q ${cx - w / 4} ${cy - h * pulse} ${cx} ${cy - h * pulse} Q ${cx + w / 4} ${cy - h * pulse} ${cx + w / 2} ${cy}`;

  return (
    <g opacity={entrance}>
      <path d={bellPath} fill="none" stroke={COLOR_TEAL} strokeWidth={1.5} opacity={0.6} />
      {/* Baseline */}
      <line
        x1={cx - w / 2}
        y1={cy}
        x2={cx + w / 2}
        y2={cy}
        stroke={COLOR_TEAL}
        strokeWidth={0.5}
        opacity={0.3}
      />
    </g>
  );
};

// ── Theta Gauge: decaying exponential curve ─────────────────────────

const ThetaGauge: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay, config: { damping: 20, stiffness: 180 } });

  // Exponential decay curve (time value erosion)
  const w = GAUGE_R * 2;
  const h = GAUGE_R;
  const points: string[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = cx - w / 2 + t * w;
    // Exponential decay: starts high on left, drops steeply on right
    const py = cy - h * Math.exp(-3 * t) * entrance;
    points.push(`${px},${py}`);
  }

  return (
    <g opacity={entrance}>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={COLOR_GOLD}
        strokeWidth={1.5}
        opacity={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Baseline */}
      <line
        x1={cx - w / 2}
        y1={cy}
        x2={cx + w / 2}
        y2={cy}
        stroke={COLOR_GOLD}
        strokeWidth={0.5}
        opacity={0.3}
      />
    </g>
  );
};

// ── Vega Gauge: oscillating bar ─────────────────────────────────────

const VegaGauge: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay, config: { damping: 20, stiffness: 180 } });

  // Oscillate width on 120-frame cycle (±15%)
  const oscillation = interpolate(frame % 120, [0, 60, 120], [0.85, 1.15, 0.85]);

  const barWidth = GAUGE_R * 2 * oscillation * entrance;
  const barHeight = 8;

  return (
    <g opacity={entrance}>
      <rect
        x={cx - barWidth / 2}
        y={cy - barHeight / 2}
        width={barWidth}
        height={barHeight}
        rx={3}
        fill={COLOR_TEAL}
        opacity={0.3}
      />
      {/* Border */}
      <rect
        x={cx - GAUGE_R}
        y={cy - barHeight / 2}
        width={GAUGE_R * 2}
        height={barHeight}
        rx={3}
        fill="none"
        stroke={COLOR_TEAL}
        strokeWidth={0.5}
        opacity={0.2}
      />
    </g>
  );
};

// ── Gauge Components Map ────────────────────────────────────────────

const gaugeComponents: Record<string, React.FC<{ cx: number; cy: number; delay: number }>> = {
  Δ: DeltaGauge,
  Γ: GammaGauge,
  θ: ThetaGauge,
  ν: VegaGauge,
};

// ── Main Component ──────────────────────────────────────────────────

export const GreeksGauges: React.FC = () => {
  // Same positioning as PayoffDiagram (right ~58% of canvas)
  const scale = 1.3;
  const svgOffsetX = 1920 * 0.40;
  const svgOffsetY = (800 - 350 * scale) / 2 - 20;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}>
          {GREEKS.map((greek, i) => {
            const GaugeComponent = gaugeComponents[greek.symbol];
            const cx = GAUGE_START_X + i * GAUGE_SPACING;
            const cy = GAUGE_ROW_Y;

            return (
              <g key={greek.symbol}>
                {/* Greek symbol label */}
                <text
                  x={cx}
                  y={cy - GAUGE_R - 8}
                  fill={greek.symbol === "θ" ? COLOR_GOLD : COLOR_TEAL}
                  fontSize={14}
                  fontFamily="monospace"
                  textAnchor="middle"
                  opacity={0.6}
                >
                  {greek.symbol}
                </text>
                <GaugeComponent cx={cx} cy={cy} delay={greek.delay} />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
