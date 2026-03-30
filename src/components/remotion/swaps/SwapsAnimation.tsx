// src/components/remotion/swaps/SwapsAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { SwapFlow } from "./layers/SwapFlow";
import { PaymentTimeline } from "./layers/PaymentTimeline";
import { SwapFloatingLabels } from "./layers/SwapFloatingLabels";
import { COLOR_BG } from "./swaps-data";

export const SwapsAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="swaps-grid" />
      </Sequence>

      {/* Layer 2: Core Swap Flow — counterparties + arcs + particles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SwapFlow />
      </Sequence>

      {/* Layer 3: Payment Timeline with pulsing ticks */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <PaymentTimeline />
      </Sequence>

      {/* Layer 4: Floating rate labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SwapFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
