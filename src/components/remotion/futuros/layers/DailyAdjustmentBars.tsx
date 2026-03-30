import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DAILY_ADJUSTMENTS, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { DailyAdjustment } from "../data";

const STAGGER_DELAY = 6;

const AnimatedBar: React.FC<{
  adjustment: DailyAdjustment;
  index: number;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ adjustment, index, x, chartHeight, barWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const color = adjustment.positive ? COLOR_BULLISH : COLOR_BEARISH;
  const targetHeight = adjustment.value * chartHeight;
  const delay = 40 + index * STAGGER_DELAY;

  // Bar grows from bottom with spring
  const barProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  const animatedHeight = targetHeight * barProgress;
  const barY = chartHeight - animatedHeight;

  return (
    <g>
      <rect
        x={x}
        y={barY}
        width={barWidth}
        height={animatedHeight}
        fill={color}
        rx={3}
        opacity={barProgress}
      />
      {/* Day label below */}
      <text
        x={x + barWidth / 2}
        y={chartHeight + 16}
        fill="rgba(232, 234, 237, 0.4)"
        fontSize={9}
        fontFamily="monospace"
        textAnchor="middle"
        opacity={barProgress}
      >
        D+{adjustment.day}
      </text>
    </g>
  );
};

export const DailyAdjustmentBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Subtle fade for loop reset
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const chartHeight = 350;
  const barWidth = 18;
  const gap = 14;
  const totalWidth = DAILY_ADJUSTMENTS.length * (barWidth + gap);
  const startX = (1920 - totalWidth) / 2 + 200;

  const axisLeft = startX - 10;
  const axisRight = startX + totalWidth;

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(700 - chartHeight) / 2})`}>
          {/* Subtle axis lines */}
          <line
            x1={axisLeft}
            y1={0}
            x2={axisLeft}
            y2={chartHeight}
            stroke="rgba(141, 245, 228, 0.15)"
            strokeWidth={1}
          />
          <line
            x1={axisLeft}
            y1={chartHeight}
            x2={axisRight}
            y2={chartHeight}
            stroke="rgba(141, 245, 228, 0.15)"
            strokeWidth={1}
          />

          {DAILY_ADJUSTMENTS.map((adj, i) => (
            <AnimatedBar
              key={i}
              adjustment={adj}
              index={i}
              x={startX + i * (barWidth + gap)}
              chartHeight={chartHeight}
              barWidth={barWidth}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
