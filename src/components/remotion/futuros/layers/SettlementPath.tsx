import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SETTLEMENT_POINTS, COLOR_AMBER } from "../data";

export const SettlementPath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Spring fade-in starting at frame 20
  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.3;

  // Leftward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.4;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const chartHeight = 500;
  const chartTop = 100;
  const startX = 500;
  const stepX = 100;

  // Build polyline points
  const points = SETTLEMENT_POINTS.map((val, i) => {
    const x = startX + i * stepX;
    const y = chartTop + (1 - val) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: "blur(3px)",
        transform: `translateX(-${drift}px)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Dashed settlement price line */}
        <polyline
          points={points}
          fill="none"
          stroke={COLOR_AMBER}
          strokeWidth={2.5}
          strokeDasharray="8,6"
        />

        {/* Settlement day dots */}
        {SETTLEMENT_POINTS.map((val, i) => {
          const x = startX + i * stepX;
          const y = chartTop + (1 - val) * chartHeight;
          const dotScale = spring({
            frame,
            fps,
            delay: 20 + i * 8,
            config: { damping: 200 },
          });
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={5 * dotScale}
              fill={COLOR_AMBER}
              opacity={0.6}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
