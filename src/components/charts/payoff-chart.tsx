"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";
import { fmt, fmtRate } from "@/lib/formatters";
import { FixingDot } from "./fixing-dot";

interface PayoffChartProps {
  forwardRate: number;
  position: string;
  notional: number;
  fixingRate?: number;
  xLabel?: string;
  overrideFixingPnL?: number;
}

export function PayoffChart({
  forwardRate,
  position,
  notional,
  fixingRate,
  xLabel,
  overrideFixingPnL,
}: PayoffChartProps) {
  // Expand range to include both forwardRate and fixingRate
  let min = forwardRate * 0.85;
  let max = forwardRate * 1.15;
  if (fixingRate) {
    min = Math.min(min, fixingRate * 0.95);
    max = Math.max(max, fixingRate * 1.05);
  }
  const range = max - min;
  const step = range / 60;
  const tolerance = range / 50; // proportional tolerance for dot matching

  const data: { fixing: number; pnl: number; zero: number }[] = [];
  for (let fixing = min; fixing <= max; fixing += step) {
    const pnl =
      position === "sell_usd"
        ? (forwardRate - fixing) * notional
        : (fixing - forwardRate) * notional;
    data.push({
      fixing: parseFloat(fixing.toFixed(4)),
      pnl: parseFloat(pnl.toFixed(0)),
      zero: 0,
    });
  }

  let fixingPnL = 0;
  if (fixingRate) {
    fixingPnL =
      position === "sell_usd"
        ? (forwardRate - fixingRate) * notional
        : (fixingRate - forwardRate) * notional;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="pnlGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="fixing"
            stroke={COLORS.textDim}
            tick={{ fontSize: 11, fill: COLORS.textMuted }}
            label={{
              value: xLabel || "Taxa de Liquidação",
              position: "insideBottom",
              offset: -5,
              fill: COLORS.textMuted,
              fontSize: 11,
            }}
          />
          <YAxis
            stroke={COLORS.textDim}
            tick={{ fontSize: 11, fill: COLORS.textMuted }}
            tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
            label={{
              value: "P&L (R$)",
              angle: -90,
              position: "insideLeft",
              fill: COLORS.textMuted,
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              color: COLORS.text,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            formatter={(v: unknown) => [fmt(v as number), "P&L"]}
            labelFormatter={(v: unknown) => `${fmtRate(v as number)}`}
          />
          <ReferenceLine y={0} stroke={COLORS.textDim} strokeDasharray="4 4" />
          {fixingRate && (
            <ReferenceLine
              x={fixingRate}
              stroke={COLORS.gold}
              strokeWidth={2}
              label={{
                value: `Liquidação: ${fmtRate(fixingRate)}`,
                fill: COLORS.gold,
                fontSize: 12,
                fontWeight: 700,
                position: "insideBottomRight",
              }}
            />
          )}
          <ReferenceLine
            x={forwardRate}
            stroke={COLORS.accent}
            strokeDasharray="4 4"
            label={{
              value: `Entrada: ${fmtRate(forwardRate)}`,
              fill: COLORS.accent,
              fontSize: 11,
              position: "top",
            }}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke={COLORS.accent}
            strokeWidth={2}
            fill="url(#pnlGreen)"
            dot={(props: Record<string, unknown>) => (
              <FixingDot
                key={props.index as number}
                cx={props.cx as number}
                cy={props.cy as number}
                payload={props.payload as { fixing: number }}
                fixingRate={fixingRate}
                fixingPnL={fixingPnL}
                tolerance={tolerance}
                overridePnL={overrideFixingPnL}
              />
            )}
            activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.text }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
