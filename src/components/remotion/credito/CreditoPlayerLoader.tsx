// src/components/remotion/credito/CreditoPlayerLoader.tsx
"use client";

import dynamic from "next/dynamic";

const CreditoPlayer = dynamic(
  () => import("./CreditoPlayer").then((m) => ({ default: m.CreditoPlayer })),
  { ssr: false },
);

export function CreditoPlayerLoader() {
  return <CreditoPlayer />;
}
