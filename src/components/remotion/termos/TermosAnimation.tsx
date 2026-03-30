import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { MidgroundBars } from "./layers/MidgroundBars";
import { ForwardCurve } from "./layers/ForwardCurve";
import { FloatingElements } from "./layers/FloatingElements";

const COLOR_BG = "#0a1628";

export const TermosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="termos-grid" />
      </Sequence>

      {/* Layer 2: Mid-ground blurred rate bars */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <MidgroundBars />
      </Sequence>

      {/* Layer 3: Foreground forward curve */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ForwardCurve />
      </Sequence>

      {/* Layer 4: Floating FX tickers + numbers */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FloatingElements />
      </Sequence>
    </AbsoluteFill>
  );
};
