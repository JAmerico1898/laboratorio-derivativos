// src/components/remotion/swaps/layers/PaymentTimeline.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PARTICLE_CYCLE_FRAMES, COLOR_TEAL } from "../swaps-data";

const TICK_COUNT = 5;
const TIMELINE_WIDTH = 400;
const TIMELINE_X_START = 50;

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

  // Position: aligned with the swap flow SVG group
  // SwapFlow uses svgOffsetX = 1920 * 0.38, svgOffsetY center. Timeline sits below.
  const svgOffsetX = 1920 * 0.38;
  const timelineY = (800 - 260) / 2 + 260 + 30; // below the 260px swap flow area + 30px gap

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX + TIMELINE_X_START}, ${timelineY})`}>
          {/* Horizontal line */}
          <line
            x1={0}
            y1={0}
            x2={TIMELINE_WIDTH}
            y2={0}
            stroke={COLOR_TEAL}
            strokeWidth={1}
            opacity={0.15}
          />

          {/* Tick markers */}
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const x = (i / (TICK_COUNT - 1)) * TIMELINE_WIDTH;

            // Each tick pulses in sequence within the particle cycle
            const tickPhase = i / TICK_COUNT;
            const cycleProgress = (frame / PARTICLE_CYCLE_FRAMES) % 1;
            // Distance from this tick's phase to current cycle progress (wrapped)
            const dist = Math.abs(cycleProgress - tickPhase);
            const wrappedDist = Math.min(dist, 1 - dist);
            // Pulse: peaks when cycleProgress ≈ tickPhase
            const pulse = interpolate(
              wrappedDist,
              [0, 0.1, 0.2],
              [1, 0.5, 0],
              { extrapolateRight: "clamp" }
            );

            const baseOpacity = 0.2;
            const pulseOpacity = baseOpacity + pulse * 0.5;
            const scale = 1 + pulse * 0.5;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={0}
                  r={3 * scale}
                  fill={COLOR_TEAL}
                  opacity={pulseOpacity}
                />
                <text
                  x={x}
                  y={18}
                  textAnchor="middle"
                  fill={COLOR_TEAL}
                  fontSize={8}
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
