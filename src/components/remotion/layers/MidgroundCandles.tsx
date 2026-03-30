import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MID_CANDLES, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { Candle } from "../data";

const CandleBar: React.FC<{
  candle: Candle;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ candle, x, chartHeight, barWidth }) => {
  const isBullish = candle.close > candle.open;
  const color = isBullish ? COLOR_BULLISH : COLOR_BEARISH;

  const bodyTop = (1 - Math.max(candle.open, candle.close)) * chartHeight;
  const bodyBottom = (1 - Math.min(candle.open, candle.close)) * chartHeight;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
  const wickTop = (1 - candle.high) * chartHeight;
  const wickBottom = (1 - candle.low) * chartHeight;
  const wickX = x + barWidth / 2;

  return (
    <g>
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={2}
      />
      <rect
        x={x}
        y={bodyTop}
        width={barWidth}
        height={bodyHeight}
        fill={color}
        rx={3}
      />
    </g>
  );
};

export const MidgroundCandles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overall fade-in via spring
  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.25;

  // Leftward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.5;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const chartHeight = 500;
  const barWidth = 28;
  const gap = 30;
  const startX = 600;

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
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(800 - chartHeight) / 2})`}>
          {MID_CANDLES.map((candle, i) => {
            const staggeredScale = spring({
              frame,
              fps,
              delay: 20 + i * 10,
              config: { damping: 200 },
            });
            return (
              <g
                key={i}
                style={{
                  transform: `scaleY(${staggeredScale})`,
                  transformOrigin: `${startX + i * (barWidth + gap) + barWidth / 2}px ${chartHeight}px`,
                }}
              >
                <CandleBar
                  candle={candle}
                  x={startX + i * (barWidth + gap)}
                  chartHeight={chartHeight}
                  barWidth={barWidth}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
