import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { RATE_LEVELS } from "../data";

export const PriceGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over 1 second
  const opacity = interpolate(frame, [0, 1 * fps], [0, 0.15], {
    extrapolateRight: "clamp",
  });

  // Slow upward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.15;
  const lineSpacing = 140;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const gridColor = "rgba(141, 245, 228, 0.4)";
  const labelColor = "rgba(141, 245, 228, 0.3)";

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(-${drift % lineSpacing}px)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {RATE_LEVELS.map((label, i) => {
          const y = 100 + i * lineSpacing;
          return (
            <g key={i}>
              <line
                x1={0}
                y1={y}
                x2={1920}
                y2={y}
                stroke={gridColor}
                strokeWidth={0.5}
              />
              <text
                x={1900}
                y={y - 6}
                fill={labelColor}
                fontSize={11}
                fontFamily="monospace"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* Extra lines above and below for drift continuity */}
        <line x1={0} y1={100 - lineSpacing} x2={1920} y2={100 - lineSpacing} stroke={gridColor} strokeWidth={0.5} />
        <line x1={0} y1={100 + RATE_LEVELS.length * lineSpacing} x2={1920} y2={100 + RATE_LEVELS.length * lineSpacing} stroke={gridColor} strokeWidth={0.5} />
      </svg>
    </AbsoluteFill>
  );
};
