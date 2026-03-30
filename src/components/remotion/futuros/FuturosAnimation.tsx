import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { PriceGrid } from "./layers/PriceGrid";
import { SettlementPath } from "./layers/SettlementPath";
import { DailyAdjustmentBars } from "./layers/DailyAdjustmentBars";
import { FuturosFloating } from "./layers/FuturosFloating";
import { COLOR_BG } from "./data";

export const FuturosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Price Grid */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <PriceGrid />
      </Sequence>

      {/* Layer 2: Settlement price path (blurred, amber) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SettlementPath />
      </Sequence>

      {/* Layer 3: Daily adjustment bars (main visual anchor) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <DailyAdjustmentBars />
      </Sequence>

      {/* Layer 4: Futures ticker + floating R$ values */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FuturosFloating />
      </Sequence>
    </AbsoluteFill>
  );
};
