// src/components/remotion/swaps/SwapsPlayerLoader.tsx
"use client";

import dynamic from "next/dynamic";

const SwapsPlayer = dynamic(
  () => import("./SwapsPlayer").then((m) => ({ default: m.SwapsPlayer })),
  { ssr: false }
);

export function SwapsPlayerLoader() {
  return <SwapsPlayer />;
}
