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
import { fmt } from "@/lib/formatters";
import { generateOptionsPayoffData } from "@/lib/calculations/options";
import { FixingDot } from "./fixing-dot";
import type { Scenario } from "@/types/scenario";
import type { OptionsResult } from "@/types/results";

interface OptionsPayoffChartProps {
  scenarioData: Scenario;
  fixingRate?: number;
  optResult?: OptionsResult;
}

export function OptionsPayoffChart({
  scenarioData,
  fixingRate,
  optResult,
}: OptionsPayoffChartProps) {
  const data = generateOptionsPayoffData(scenarioData);
  const md = scenarioData.context.marketData;
  const spot = md.spotRate as number;
  const totalPnL =
    (optResult?.totalPnL as number | undefined) ??
    (optResult?.combinedPnL as number | undefined) ??
    (optResult?.optionsPnL as number | undefined) ??
    0;
  // Find the single closest data point to fixingRate
  let closestIdx = -1;
  if (fixingRate) {
    let minDist = Infinity;
    for (let i = 0; i < data.length; i++) {
      const dist = Math.abs(data[i].fixing - fixingRate);
      if (dist < minDist) { minDist = dist; closestIdx = i; }
    }
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="optGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="fixing"
            stroke={COLORS.textDim}
            tick={{ fontSize: 11, fill: COLORS.textMuted }}
            label={{
              value: "Preço do Ativo no Vencimento",
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
            labelFormatter={(v: unknown) => `Preço: R$ ${Number(v).toFixed(2)}`}
          />
          <ReferenceLine y={0} stroke={COLORS.textDim} strokeDasharray="4 4" />
          {fixingRate && (
            <ReferenceLine
              x={fixingRate}
              stroke={COLORS.gold}
              strokeWidth={2}
              label={{
                value: `Vcto: R$ ${fixingRate.toFixed(2)}`,
                fill: COLORS.gold,
                fontSize: 12,
                fontWeight: 700,
                position: "insideBottomRight",
              }}
            />
          )}
          <ReferenceLine
            x={spot}
            stroke={COLORS.accent}
            strokeDasharray="4 4"
            label={{
              value: `Spot: R$ ${spot.toFixed(2)}`,
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
            fill="url(#optGreen)"
            dot={(props: Record<string, unknown>) => (
              <FixingDot
                key={props.index as number}
                cx={props.cx as number}
                cy={props.cy as number}
                payload={props.payload as { fixing: number }}
                fixingRate={fixingRate}
                fixingPnL={0}
                overridePnL={totalPnL}
                index={props.index as number}
                targetIndex={closestIdx}
              />
            )}
            activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.text }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
