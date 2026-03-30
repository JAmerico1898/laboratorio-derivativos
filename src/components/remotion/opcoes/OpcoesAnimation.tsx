// src/components/remotion/opcoes/OpcoesAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { PayoffDiagram } from "./layers/PayoffDiagram";
import { GreeksGauges } from "./layers/GreeksGauges";
import { OpcoesFloatingLabels } from "./layers/OpcoesFloatingLabels";
import { COLOR_BG } from "./opcoes-data";

export const OpcoesAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="opcoes-grid" />
      </Sequence>

      {/* Layer 2: Payoff Diagram — axes + call/put curves + zones */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <PayoffDiagram />
      </Sequence>

      {/* Layer 3: Greeks Gauges — Δ, Γ, θ, ν indicators */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <GreeksGauges />
      </Sequence>

      {/* Layer 4: Floating financial labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <OpcoesFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
