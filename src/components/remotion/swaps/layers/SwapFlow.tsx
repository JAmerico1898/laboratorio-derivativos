// src/components/remotion/swaps/layers/SwapFlow.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  PARTY_A,
  PARTY_B,
  ARC_TOP,
  ARC_BOTTOM,
  PARTICLES_PER_ARC,
  PARTICLE_CYCLE_FRAMES,
  COLOR_TEAL,
  COLOR_GOLD,
  getQuadraticPoint,
} from "../swaps-data";
import type { Point } from "../swaps-data";

const NODE_RADIUS = 45;

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
        y={-6}
        textAnchor="middle"
        fill={color}
        fontSize={16}
        fontFamily="monospace"
        opacity={0.9}
      >
        {label}
      </text>
      <text
        x={0}
        y={14}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontFamily="monospace"
        opacity={0.5}
      >
        {sublabel}
      </text>
    </g>
  );
};

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

const FlowParticles: React.FC<{
  arc: { start: Point; control: Point; end: Point };
  color: string;
  delayFrames: number;
}> = ({ arc, color, delayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Wait for arc to appear before showing particles
  const arcVisible = spring({
    frame,
    fps,
    delay: delayFrames,
    config: { damping: 200 },
  });

  if (arcVisible < 0.5) return null;

  const particles = Array.from({ length: PARTICLES_PER_ARC }, (_, i) => {
    const offset = i / PARTICLES_PER_ARC;
    const t = ((frame / PARTICLE_CYCLE_FRAMES) + offset) % 1;
    const point = getQuadraticPoint(t, arc.start, arc.control, arc.end);

    // Pulse opacity: peaks in the middle of the journey
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
        opacity={pulseOpacity}
      />
    );
  });

  return <g>{particles}</g>;
};

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
      fontSize={14}
      fontFamily="monospace"
      opacity={progress * 0.6}
    >
      {text}
    </text>
  );
};

export const SwapFlow: React.FC = () => {
  // SVG viewBox is 600x260, scaled 1.4x and positioned in the right portion of 1920x800
  const scale = 1.4;
  const svgOffsetX = 1920 * 0.42; // shifted right
  const svgOffsetY = (800 - 260 * scale) / 2; // vertically centered at scaled size

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
            center={PARTY_A}
            color={COLOR_TEAL}
            label="Parte A"
            sublabel="Paga DI"
            delay={20}
          />
          <CounterpartyNode
            center={PARTY_B}
            color={COLOR_GOLD}
            label="Parte B"
            sublabel="Paga Pré"
            delay={30}
          />

          {/* Flow arcs */}
          <FlowArc arc={ARC_TOP} color={COLOR_TEAL} delay={40} />
          <FlowArc arc={ARC_BOTTOM} color={COLOR_GOLD} delay={40} />

          {/* Arc labels */}
          <ArcLabel text="DI / CDI →" x={300} y={12} color={COLOR_TEAL} delay={45} />
          <ArcLabel text="← USD / Pré" x={300} y={255} color={COLOR_GOLD} delay={45} />

          {/* Animated particles */}
          <FlowParticles arc={ARC_TOP} color={COLOR_TEAL} delayFrames={50} />
          <FlowParticles arc={ARC_BOTTOM} color={COLOR_GOLD} delayFrames={50} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
