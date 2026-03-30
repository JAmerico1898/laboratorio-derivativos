// src/components/remotion/embutidos/layers/ContractDecomposition.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DECOMP_VIEWBOX_H,
  COE_CENTER,
  COE_WIDTH,
  COE_HEIGHT,
  ZERO_COUPON_X,
  CALL_OPTION_X,
  HALF_WIDTH,
  HALF_HEIGHT,
  TOP_ARC,
  BOTTOM_ARC,
  PARTICLES_PER_ARC,
  PARTICLE_CYCLE_FRAMES,
  COLOR_TEAL,
  COLOR_GOLD,
  COLOR_TEXT,
  COLOR_TEXT_DIM,
  getQuadraticPoint,
} from "../embutidos-data";

// ── COE Envelope (whole state) ─────────────────────────────────────

const COEEnvelope: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cx = COE_CENTER.x;
  const cy = COE_CENTER.y;

  return (
    <g opacity={opacity}>
      <rect
        x={cx - COE_WIDTH / 2}
        y={cy - COE_HEIGHT / 2}
        width={COE_WIDTH}
        height={COE_HEIGHT}
        rx={12}
        fill="none"
        stroke={COLOR_TEXT_DIM}
        strokeWidth={2}
        strokeDasharray="8,4"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLOR_TEXT}
        fontSize={20}
        fontFamily="monospace"
        opacity={0.8}
      >
        COE
      </text>
    </g>
  );
};

// ── Half Component (Zero-Coupon or Call Option) ────────────────────

const ContractHalf: React.FC<{
  cx: number;
  cy: number;
  color: string;
  label: string;
  sublabel: string;
  opacity: number;
}> = ({ cx, cy, color, label, sublabel, opacity }) => {
  return (
    <g opacity={opacity}>
      <rect
        x={cx - HALF_WIDTH / 2}
        y={cy - HALF_HEIGHT / 2}
        width={HALF_WIDTH}
        height={HALF_HEIGHT}
        rx={10}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy - 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.9}
      >
        {label}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.5}
      >
        {sublabel}
      </text>
    </g>
  );
};

// ── Ghost Outline (stays at center after split) ────────────────────

const GhostOutline: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cx = COE_CENTER.x;
  const cy = COE_CENTER.y;

  return (
    <rect
      x={cx - COE_WIDTH / 2}
      y={cy - COE_HEIGHT / 2}
      width={COE_WIDTH}
      height={COE_HEIGHT}
      rx={12}
      fill="none"
      stroke={COLOR_TEXT_DIM}
      strokeWidth={1}
      strokeDasharray="4,8"
      opacity={opacity * 0.15}
    />
  );
};

// ── Flow Particles ─────────────────────────────────────────────────

const FlowParticles: React.FC<{
  arc: { start: { x: number; y: number }; control: { x: number; y: number }; end: { x: number; y: number } };
  color: string;
  visible: boolean;
}> = ({ arc, color, visible }) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const particles = Array.from({ length: PARTICLES_PER_ARC }, (_, i) => {
    const offset = i / PARTICLES_PER_ARC;
    const t = ((frame / PARTICLE_CYCLE_FRAMES) + offset) % 1;
    const point = getQuadraticPoint(t, arc.start, arc.control, arc.end);

    const pulseOpacity = interpolate(
      t,
      [0, 0.15, 0.5, 0.85, 1],
      [0.4, 0.8, 0.9, 0.8, 0.4],
    );

    return (
      <circle
        key={i}
        cx={point.x}
        cy={point.y}
        r={3.5}
        fill={color}
        opacity={pulseOpacity * 0.8}
      />
    );
  });

  return <g>{particles}</g>;
};

// ── Flow Arc Path ──────────────────────────────────────────────────

const FlowArcPath: React.FC<{
  arc: { start: { x: number; y: number }; control: { x: number; y: number }; end: { x: number; y: number } };
  color: string;
  opacity: number;
}> = ({ arc, color, opacity }) => {
  const pathD = `M ${arc.start.x} ${arc.start.y} Q ${arc.control.x} ${arc.control.y} ${arc.end.x} ${arc.end.y}`;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={opacity * 0.3}
      strokeDasharray="4,4"
    />
  );
};

// ── Main Component ─────────────────────────────────────────────────

export const ContractDecomposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Entrance (frames 0-30)
  const entrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });

  // Phase 2: Split (frames 60-90)
  const splitProgress = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 20, stiffness: 180 },
  });

  // Phase 3: Rejoin (frames 210-240)
  const rejoinProgress = spring({
    frame,
    fps,
    delay: 210,
    config: { damping: 20, stiffness: 180 },
  });

  // Combined split state: 0 = whole, 1 = split
  const splitState = splitProgress - rejoinProgress;
  const isSplit = splitState > 0.1;

  // Whole envelope opacity: visible when not split
  const envelopeOpacity = entrance * (1 - splitState);

  // Half positions: interpolate from center to separated
  const leftX = COE_CENTER.x + (ZERO_COUPON_X - COE_CENTER.x) * splitState;
  const rightX = COE_CENTER.x + (CALL_OPTION_X - COE_CENTER.x) * splitState;
  const cy = COE_CENTER.y;

  // Ghost and arc visibility
  const ghostOpacity = splitState;
  const arcOpacity = splitState;

  // Loop reset: fade everything at frame 270-300
  const loopFade = interpolate(frame, [270, 295], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = 1.3;
  const svgOffsetX = 1920 * 0.35;
  const svgOffsetY = (800 - DECOMP_VIEWBOX_H * scale) / 2 - 40;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}
          opacity={loopFade}
        >
          {/* Ghost outline at center (visible during split) */}
          <GhostOutline opacity={ghostOpacity} />

          {/* Whole COE envelope */}
          <COEEnvelope opacity={envelopeOpacity} />

          {/* Separated halves */}
          <ContractHalf
            cx={leftX}
            cy={cy}
            color={COLOR_TEAL}
            label="Zero-Coupon"
            sublabel="Hospedeiro"
            opacity={entrance * splitState}
          />
          <ContractHalf
            cx={rightX}
            cy={cy}
            color={COLOR_GOLD}
            label="Call S&P 500"
            sublabel="Embutido"
            opacity={entrance * splitState}
          />

          {/* Flow arc paths */}
          <FlowArcPath arc={TOP_ARC} color={COLOR_TEAL} opacity={arcOpacity} />
          <FlowArcPath arc={BOTTOM_ARC} color={COLOR_GOLD} opacity={arcOpacity} />

          {/* Flow particles */}
          <FlowParticles arc={TOP_ARC} color={COLOR_TEAL} visible={isSplit} />
          <FlowParticles arc={BOTTOM_ARC} color={COLOR_GOLD} visible={isSplit} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
