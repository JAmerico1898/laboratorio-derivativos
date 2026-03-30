// src/components/remotion/credito/CreditoAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { CreditSpreadCurve } from "./layers/CreditSpreadCurve";
import { CDSFlow } from "./layers/CDSFlow";
import { CreditoFloatingLabels } from "./layers/CreditoFloatingLabels";
import { COLOR_BG } from "./credito-data";

export const CreditoAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="credito-grid" />
      </Sequence>

      {/* Layer 2: Credit Spread Curve — yield curves + spread area */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <CreditSpreadCurve />
      </Sequence>

      {/* Layer 3: CDS Flow — protection buyer/seller + credit event */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <CDSFlow />
      </Sequence>

      {/* Layer 4: Floating financial labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <CreditoFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
