import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TICKERS, FLOATING_NUMBERS, COLOR_TEAL } from "../data";

const TICKER_CYCLE_DURATION = 60; // frames per fade cycle for floating numbers

const TickerTape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Build ticker string
  const tickerText = TICKERS.map(
    (t) => `${t.symbol} ${t.price} ${t.positive ? "▲" : "▼"}${t.change}`
  ).join("   ·   ");

  // Duplicate for seamless scroll
  const fullText = `${tickerText}   ·   ${tickerText}`;

  // Scroll speed: complete one cycle over the full duration
  const scrollX = interpolate(frame, [0, durationInFrames], [0, -1200]);

  return (
    <div
      style={{
        position: "absolute",
        top: 15,
        left: 0,
        right: 0,
        overflow: "hidden",
        opacity: fadeIn,
        height: 30,
      }}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 2,
          transform: `translateX(${scrollX}px)`,
          display: "flex",
          gap: 0,
        }}
      >
        {fullText.split("   ·   ").map((segment, i) => {
          const ticker = TICKERS[i % TICKERS.length];
          const arrowColor = ticker.positive
            ? "rgba(0, 200, 83, 0.6)"
            : "rgba(255, 23, 68, 0.6)";
          return (
            <span key={i} style={{ marginRight: 24 }}>
              <span style={{ color: `rgba(141, 245, 228, 0.35)` }}>
                {ticker.symbol} {ticker.price}{" "}
              </span>
              <span style={{ color: arrowColor }}>
                {ticker.positive ? "▲" : "▼"}{ticker.change}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const FloatingNumber: React.FC<{
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
}> = ({ value, x, y, fontSize, cycleOffset, driftX, driftY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cyclic fade: each number fades in and out on its own schedule
  const cycleFrame = (frame + cycleOffset) % (TICKER_CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, TICKER_CYCLE_DURATION * 0.3, TICKER_CYCLE_DURATION, TICKER_CYCLE_DURATION * 1.3, TICKER_CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const posX = x * 1920 + frame * driftX;
  const posY = y * 800 + frame * driftY;

  return (
    <div
      style={{
        position: "absolute",
        left: posX,
        top: posY,
        fontFamily: "monospace",
        fontSize,
        color: COLOR_TEAL,
        opacity: fadeIn * cycleOpacity * 0.12,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const FloatingElements: React.FC = () => {
  return (
    <AbsoluteFill>
      <TickerTape />
      {FLOATING_NUMBERS.map((num, i) => (
        <FloatingNumber key={i} {...num} />
      ))}
    </AbsoluteFill>
  );
};
