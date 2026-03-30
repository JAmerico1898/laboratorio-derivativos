// src/components/remotion/embutidos/EmbutidosAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { ContractDecomposition } from "./layers/ContractDecomposition";
import { PayoffWaterfall } from "./layers/PayoffWaterfall";
import { EmbutidosFloatingLabels } from "./layers/EmbutidosFloatingLabels";
import { COLOR_BG } from "./embutidos-data";

export const EmbutidosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="embutidos-grid" />
      </Sequence>

      {/* Layer 2: Contract Decomposition — COE splits into bond + option */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ContractDecomposition />
      </Sequence>

      {/* Layer 3: Payoff Waterfall — value decomposition bars */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <PayoffWaterfall />
      </Sequence>

      {/* Layer 4: Floating product-type labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <EmbutidosFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
