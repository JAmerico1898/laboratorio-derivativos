// src/components/remotion/swaps/layers/PaymentTimeline.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PARTICLE_CYCLE_FRAMES, PARTY_A, PARTY_B, COLOR_TEAL } from "../swaps-data";

const TICK_COUNT = 5;
// Timeline spans from PARTY_A.x to PARTY_B.x
const TIMELINE_START = PARTY_A.x; // 100
const TIMELINE_END = PARTY_B.x;   // 500
const TIMELINE_WIDTH = TIMELINE_END - TIMELINE_START;

export const PaymentTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in after arcs appear
  const fadeIn = spring({
    frame,
    fps,
    delay: 50,
    config: { damping: 200 },
  });

  // Same coordinate system as SwapFlow (scale 1.4, offset 42%)
  const diagramScale = 1.4;
  const svgOffsetX = 1920 * 0.42;
  const timelineY = (800 - 260 * diagramScale) / 2 + 260 * diagramScale + 20;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${timelineY}) scale(${diagramScale})`}>
          {/* Horizontal line from Parte A center to Parte B center */}
          <line
            x1={TIMELINE_START}
            y1={0}
            x2={TIMELINE_END}
            y2={0}
            stroke={COLOR_TEAL}
            strokeWidth={1}
            opacity={0.15}
          />

          {/* Tick markers */}
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const x = TIMELINE_START + (i / (TICK_COUNT - 1)) * TIMELINE_WIDTH;

            // Each tick pulses in sequence within the particle cycle
            const tickPhase = i / TICK_COUNT;
            const cycleProgress = (frame / PARTICLE_CYCLE_FRAMES) % 1;
            const dist = Math.abs(cycleProgress - tickPhase);
            const wrappedDist = Math.min(dist, 1 - dist);
            const pulse = interpolate(
              wrappedDist,
              [0, 0.1, 0.2],
              [1, 0.5, 0],
              { extrapolateRight: "clamp" }
            );

            const baseOpacity = 0.2;
            const pulseOpacity = baseOpacity + pulse * 0.5;
            const tickScale = 1 + pulse * 0.5;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={0}
                  r={3 * tickScale}
                  fill={COLOR_TEAL}
                  opacity={pulseOpacity}
                />
                <text
                  x={x}
                  y={18}
                  textAnchor="middle"
                  fill={COLOR_TEAL}
                  fontSize={10}
                  fontFamily="monospace"
                  opacity={0.3}
                >
                  {`T${i + 1}`}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
