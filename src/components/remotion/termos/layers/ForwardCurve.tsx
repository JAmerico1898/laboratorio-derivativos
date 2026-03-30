import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_RATES } from "../data";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 350;
const OFFSET_X = (1920 - CHART_WIDTH) / 2 + 200;
const OFFSET_Y = (700 - CHART_HEIGHT) / 2;

const RATE_MIN = 5.0;
const RATE_MAX = 5.6;

const COLOR_TEAL = "#8df5e4";
const COLOR_SPOT = "rgba(0, 200, 83, 0.4)";
const COLOR_AXIS = "rgba(141, 245, 228, 0.15)";
const COLOR_LABEL = "rgba(141, 245, 228, 0.5)";

function rateToY(rate: number): number {
  return CHART_HEIGHT - ((rate - RATE_MIN) / (RATE_MAX - RATE_MIN)) * CHART_HEIGHT;
}

function tenorToX(index: number): number {
  return (index / (NDF_RATES.length - 1)) * CHART_WIDTH;
}

const DataPoint: React.FC<{
  rate: typeof NDF_RATES[number];
  index: number;
}> = ({ rate, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 60 + index * 12;
  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  const cx = tenorToX(index);
  const cy = rateToY(rate.rate);

  return (
    <g opacity={progress}>
      {/* Data point circle */}
      <circle
        cx={cx}
        cy={cy}
        r={5 * progress}
        fill={COLOR_TEAL}
      />
      {/* Rate label above */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill={COLOR_TEAL}
        fontSize={12}
        fontFamily="monospace"
        opacity={0.8}
      >
        {rate.rate.toFixed(2)}
      </text>
      {/* Tenor label below axis */}
      <text
        x={cx}
        y={CHART_HEIGHT + 20}
        textAnchor="middle"
        fill={COLOR_LABEL}
        fontSize={11}
        fontFamily="monospace"
      >
        {rate.tenor}
      </text>
    </g>
  );
};

export const ForwardCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Loop fade
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Spot reference line — draws from left to right (frames 40-60)
  const spotLineProgress = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spotY = rateToY(NDF_RATES[0].rate);

  // Curve path — build as SVG path string
  const pathPoints = NDF_RATES.map((r, i) => {
    const x = tenorToX(i);
    const y = rateToY(r.rate);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  // Curve draw progress — synchronized with data points
  const PATH_LENGTH = 800;
  const curveProgress = interpolate(
    frame,
    [60, 60 + (NDF_RATES.length - 1) * 12 + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${OFFSET_X}, ${OFFSET_Y})`}>
          {/* Y-axis */}
          <line
            x1={-10}
            y1={0}
            x2={-10}
            y2={CHART_HEIGHT}
            stroke={COLOR_AXIS}
            strokeWidth={1}
          />
          {/* X-axis */}
          <line
            x1={-10}
            y1={CHART_HEIGHT}
            x2={CHART_WIDTH + 10}
            y2={CHART_HEIGHT}
            stroke={COLOR_AXIS}
            strokeWidth={1}
          />

          {/* Spot reference dashed line */}
          <line
            x1={0}
            y1={spotY}
            x2={CHART_WIDTH * spotLineProgress}
            y2={spotY}
            stroke={COLOR_SPOT}
            strokeWidth={1}
            strokeDasharray="6,4"
          />
          {spotLineProgress > 0.5 && (
            <text
              x={CHART_WIDTH + 15}
              y={spotY + 4}
              fill={COLOR_SPOT}
              fontSize={10}
              fontFamily="monospace"
              opacity={spotLineProgress}
            >
              Spot
            </text>
          )}

          {/* Curve path */}
          <path
            d={pathPoints}
            fill="none"
            stroke={COLOR_TEAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PATH_LENGTH}
            strokeDashoffset={PATH_LENGTH * (1 - curveProgress)}
          />

          {/* Data points */}
          {NDF_RATES.map((rate, i) => (
            <DataPoint key={i} rate={rate} index={i} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
