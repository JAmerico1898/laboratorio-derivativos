// src/components/remotion/credito/layers/CDSFlow.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  PROTECTION_BUYER,
  PROTECTION_SELLER,
  REFERENCE_ENTITY,
  PREMIUM_ARC,
  PROTECTION_ARC,
  PARTICLES_PER_ARC,
  PARTICLE_CYCLE_FRAMES,
  CREDIT_EVENT_CYCLE,
  CREDIT_EVENT_TRIGGER_FRAME,
  COLOR_TEAL,
  COLOR_GOLD,
  COLOR_RED,
  getQuadraticPoint,
} from "../credito-data";
import type { Point } from "../credito-data";

const NODE_RADIUS = 45;

// ── Counterparty Node ───────────────────────────────────────────────

const CounterpartyNode: React.FC<{
  center: Point;
  color: string;
  label: string;
  sublabel: string;
  delay: number;
}> = ({ center, color, label, sublabel, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 180 },
  });

  return (
    <g opacity={progress} transform={`translate(${center.x}, ${center.y})`}>
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS * progress}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.8}
      />
      <text
        x={0}
        y={2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={14}
        fontFamily="monospace"
        opacity={0.9}
      >
        {label}
      </text>
      <text
        x={0}
        y={22}
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

// ── Reference Entity ────────────────────────────────────────────────

const ReferenceEntityNode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 200 },
  });

  const { x, y } = REFERENCE_ENTITY;
  const w = 140;
  const h = 36;

  return (
    <g opacity={progress * 0.6}>
      {/* Dashed connections to buyer and seller */}
      <line
        x1={PROTECTION_BUYER.x}
        y1={PROTECTION_BUYER.y + NODE_RADIUS}
        x2={x}
        y2={y - h / 2}
        stroke="white"
        strokeWidth={0.5}
        strokeDasharray="4,6"
        opacity={0.2}
      />
      <line
        x1={PROTECTION_SELLER.x}
        y1={PROTECTION_SELLER.y + NODE_RADIUS}
        x2={x}
        y2={y - h / 2}
        stroke="white"
        strokeWidth={0.5}
        strokeDasharray="4,6"
        opacity={0.2}
      />
      {/* Rounded rect */}
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={6}
        fill="none"
        stroke="white"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.3}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontFamily="monospace"
        opacity={0.5}
        dominantBaseline="middle"
      >
        Entidade de Referência
      </text>
    </g>
  );
};

// ── Flow Arc ────────────────────────────────────────────────────────

const FlowArc: React.FC<{
  arc: { start: Point; control: Point; end: Point };
  color: string;
  delay: number;
}> = ({ arc, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  const pathD = `M ${arc.start.x} ${arc.start.y} Q ${arc.control.x} ${arc.control.y} ${arc.end.x} ${arc.end.y}`;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={progress * 0.3}
      strokeDasharray="4,4"
    />
  );
};

// ── Arc Label ───────────────────────────────────────────────────────

const ArcLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  color: string;
  delay: number;
}> = ({ text, x, y, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={13}
      fontFamily="monospace"
      opacity={progress * 0.6}
    >
      {text}
    </text>
  );
};

// ── Flow Particles ──────────────────────────────────────────────────

const FlowParticles: React.FC<{
  arc: { start: Point; control: Point; end: Point };
  color: string;
  delayFrames: number;
  isCreditEvent: boolean;
}> = ({ arc, color, delayFrames, isCreditEvent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arcVisible = spring({
    frame,
    fps,
    delay: delayFrames,
    config: { damping: 200 },
  });

  if (arcVisible < 0.5) return null;

  const activeColor = isCreditEvent ? COLOR_RED : color;

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
        r={isCreditEvent ? 4.5 : 3.5}
        fill={activeColor}
        opacity={pulseOpacity * (isCreditEvent ? 1 : 0.8)}
      />
    );
  });

  return <g>{particles}</g>;
};

// ── Credit Event Pulse ──────────────────────────────────────────────

const CreditEventPulse: React.FC = () => {
  const frame = useCurrentFrame();

  const cycleFrame = frame % CREDIT_EVENT_CYCLE;
  const isActive = cycleFrame >= CREDIT_EVENT_TRIGGER_FRAME;

  if (!isActive) return null;

  const eventFrame = cycleFrame - CREDIT_EVENT_TRIGGER_FRAME;
  const eventDuration = CREDIT_EVENT_CYCLE - CREDIT_EVENT_TRIGGER_FRAME; // 30 frames

  const radius = interpolate(eventFrame, [0, eventDuration], [0, 60], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(eventFrame, [0, eventDuration * 0.5, eventDuration], [0.6, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  const { x, y } = REFERENCE_ENTITY;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke={COLOR_RED}
        strokeWidth={2}
        opacity={opacity}
      />
      {/* Inner glow */}
      <circle
        cx={x}
        cy={y}
        r={radius * 0.5}
        fill={COLOR_RED}
        opacity={opacity * 0.15}
      />
    </g>
  );
};

// ── Main Component ──────────────────────────────────────────────────

export const CDSFlow: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = 1.0;
  const svgOffsetX = 1920 * 0.45;
  const svgOffsetY = 420;

  // Credit event state for particles
  const cycleFrame = frame % CREDIT_EVENT_CYCLE;
  const isCreditEvent = cycleFrame >= CREDIT_EVENT_TRIGGER_FRAME;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}>
          {/* Counterparty nodes */}
          <CounterpartyNode
            center={PROTECTION_BUYER}
            color={COLOR_TEAL}
            label="Comprador"
            sublabel="Proteção"
            delay={20}
          />
          <CounterpartyNode
            center={PROTECTION_SELLER}
            color={COLOR_GOLD}
            label="Vendedor"
            sublabel="Proteção"
            delay={30}
          />

          {/* Reference Entity */}
          <ReferenceEntityNode />

          {/* Flow arcs */}
          <FlowArc arc={PREMIUM_ARC} color={COLOR_TEAL} delay={40} />
          <FlowArc arc={PROTECTION_ARC} color={COLOR_GOLD} delay={40} />

          {/* Arc labels */}
          <ArcLabel text="Prêmio CDS →" x={300} y={6} color={COLOR_TEAL} delay={45} />
          <ArcLabel text="← Proteção" x={300} y={195} color={COLOR_GOLD} delay={45} />

          {/* Animated particles */}
          <FlowParticles arc={PREMIUM_ARC} color={COLOR_TEAL} delayFrames={50} isCreditEvent={false} />
          <FlowParticles arc={PROTECTION_ARC} color={COLOR_GOLD} delayFrames={50} isCreditEvent={isCreditEvent} />

          {/* Credit event pulse */}
          <CreditEventPulse />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
