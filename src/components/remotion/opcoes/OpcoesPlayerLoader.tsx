// src/components/remotion/opcoes/OpcoesPlayerLoader.tsx
"use client";

import dynamic from "next/dynamic";

const OpcoesPlayer = dynamic(
  () => import("./OpcoesPlayer").then((m) => ({ default: m.OpcoesPlayer })),
  { ssr: false },
);

export function OpcoesPlayerLoader() {
  return <OpcoesPlayer />;
}
