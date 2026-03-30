import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_TICKERS, NDF_FLOATING_NUMBERS } from "../data";

const TICKER_CYCLE_DURATION = 60;
const COLOR_TEAL = "#8df5e4";

const TickerTape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        {/* Duplicate for seamless scroll */}
        {[...NDF_TICKERS, ...NDF_TICKERS].map((ticker, i) => {
          const arrowColor = ticker.positive
            ? "rgba(0, 200, 83, 0.6)"
            : "rgba(255, 23, 68, 0.6)";
          return (
            <span key={i} style={{ marginRight: 24 }}>
              <span style={{ color: "rgba(141, 245, 228, 0.35)" }}>
                {ticker.symbol} {ticker.price}{" "}
              </span>
              {ticker.change && (
                <span style={{ color: arrowColor }}>
                  {ticker.positive ? "▲" : "▼"}{ticker.change}
                </span>
              )}
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

  const cycleFrame = (frame + cycleOffset) % (TICKER_CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, TICKER_CYCLE_DURATION * 0.3, TICKER_CYCLE_DURATION, TICKER_CYCLE_DURATION * 1.3, TICKER_CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const posX = x * 1920 + frame * driftX;
  const posY = y * 700 + frame * driftY;

  return (
    <div
      style={{
        position: "absolute",
        left: posX,
        top: posY,
        fontFamily: "monospace",
        fontSize,
        color: COLOR_TEAL,
        opacity: fadeIn * cycleOpacity * 0.25,
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
      {NDF_FLOATING_NUMBERS.map((num, i) => (
        <FloatingNumber key={i} {...num} />
      ))}
    </AbsoluteFill>
  );
};
