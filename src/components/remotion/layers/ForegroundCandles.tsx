import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CANDLES, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { Candle } from "../data";

const STAGGER_DELAY = 5;

const AnimatedCandle: React.FC<{
  candle: Candle;
  index: number;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ candle, index, x, chartHeight, barWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBullish = candle.close > candle.open;
  const color = isBullish ? COLOR_BULLISH : COLOR_BEARISH;

  const bodyTop = (1 - Math.max(candle.open, candle.close)) * chartHeight;
  const bodyBottom = (1 - Math.min(candle.open, candle.close)) * chartHeight;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
  const wickTop = (1 - candle.high) * chartHeight;
  const wickBottom = (1 - candle.low) * chartHeight;
  const wickX = x + barWidth / 2;

  const delay = 40 + index * STAGGER_DELAY;

  // Wick extends first
  const wickProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  // Body fills slightly after wick
  const bodyProgress = spring({
    frame,
    fps,
    delay: delay + 5,
    config: { damping: 20, stiffness: 200 },
  });

  const wickHeight = (wickBottom - wickTop) * wickProgress;
  const animatedBodyHeight = bodyHeight * bodyProgress;

  return (
    <g>
      <line
        x1={wickX}
        y1={wickBottom - wickHeight}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={2}
        opacity={wickProgress}
      />
      <rect
        x={x}
        y={bodyTop + bodyHeight - animatedBodyHeight}
        width={barWidth}
        height={animatedBodyHeight}
        fill={color}
        rx={2}
        opacity={bodyProgress}
      />
    </g>
  );
};

export const ForegroundCandles: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Subtle fade for loop reset
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const chartHeight = 450;
  const barWidth = 14;
  const gap = 12;
  // Center the chart horizontally, offset to the right side
  const totalWidth = CANDLES.length * (barWidth + gap);
  const startX = (1920 - totalWidth) / 2 + 200;

  // Axis lines
  const axisLeft = startX - 10;
  const axisRight = startX + totalWidth;

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(800 - chartHeight) / 2})`}>
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

          {CANDLES.map((candle, i) => (
            <AnimatedCandle
              key={i}
              candle={candle}
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
