// src/components/remotion/opcoes/layers/OpcoesFloatingLabels.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FLOATING_LABELS } from "../opcoes-data";

const CYCLE_DURATION = 60;

const FloatingLabel: React.FC<{
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
  color: string;
}> = ({ value, x, y, fontSize, cycleOffset, driftX, driftY, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [2 * fps, 3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cyclic fade: each label fades in and out on its own schedule
  const cycleFrame = (frame + cycleOffset) % (CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, CYCLE_DURATION * 0.3, CYCLE_DURATION, CYCLE_DURATION * 1.3, CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
        color,
        opacity: fadeIn * cycleOpacity * 0.15,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const OpcoesFloatingLabels: React.FC = () => {
  return (
    <AbsoluteFill>
      {FLOATING_LABELS.map((label, i) => (
        <FloatingLabel key={i} {...label} />
      ))}
    </AbsoluteFill>
  );
};
