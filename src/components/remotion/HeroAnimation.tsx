import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "./layers/BackgroundGrid";
import { MidgroundCandles } from "./layers/MidgroundCandles";
import { ForegroundCandles } from "./layers/ForegroundCandles";
import { FloatingElements } from "./layers/FloatingElements";
import { COLOR_BG } from "./data";

export const HeroAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid />
      </Sequence>

      {/* Layer 2: Mid-ground blurred candles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <MidgroundCandles />
      </Sequence>

      {/* Layer 3: Foreground sharp candles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ForegroundCandles />
      </Sequence>

      {/* Layer 4: Floating ticker + numbers */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FloatingElements />
      </Sequence>
    </AbsoluteFill>
  );
};
