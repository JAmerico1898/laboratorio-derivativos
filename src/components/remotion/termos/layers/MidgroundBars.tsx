import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_MID_BARS } from "../data";

const CHART_HEIGHT = 450;
const BAR_WIDTH = 40;
const GAP = 50;
const START_X = 650;
const COLOR_TEAL = "#8df5e4";

const RateBar: React.FC<{
  height: number;
  x: number;
  chartHeight: number;
}> = ({ height, x, chartHeight }) => {
  const barHeight = height * chartHeight * 0.7;
  const y = chartHeight - barHeight;

  return (
    <rect
      x={x}
      y={y}
      width={BAR_WIDTH}
      height={barHeight}
      fill={COLOR_TEAL}
      rx={4}
    />
  );
};

export const MidgroundBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.35;

  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.4;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

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
        <g transform={`translate(0, ${(700 - CHART_HEIGHT) / 2})`}>
          {NDF_MID_BARS.map((bar, i) => {
            const staggeredScale = spring({
              frame,
              fps,
              delay: 20 + i * 10,
              config: { damping: 200 },
            });
            const x = START_X + i * (BAR_WIDTH + GAP);
            return (
              <g
                key={i}
                style={{
                  transform: `scaleY(${staggeredScale})`,
                  transformOrigin: `${x + BAR_WIDTH / 2}px ${CHART_HEIGHT}px`,
                }}
              >
                <RateBar
                  height={bar.height}
                  x={x}
                  chartHeight={CHART_HEIGHT}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
