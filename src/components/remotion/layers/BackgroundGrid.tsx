import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over 1 second
  const opacity = interpolate(frame, [0, 1 * fps], [0, 0.08], {
    extrapolateRight: "clamp",
  });

  // Slow upward drift, with smooth reset for looping
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.2;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const gridColor = `rgba(141, 245, 228, 0.4)`;
  const gridSize = 30;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(-${drift % gridSize}px)`,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hero-grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <line x1={gridSize} y1="0" x2={gridSize} y2={gridSize} stroke={gridColor} strokeWidth="0.5" />
            <line x1="0" y1={gridSize} x2={gridSize} y2={gridSize} stroke={gridColor} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="200%" fill="url(#hero-grid)" />
      </svg>
    </AbsoluteFill>
  );
};
