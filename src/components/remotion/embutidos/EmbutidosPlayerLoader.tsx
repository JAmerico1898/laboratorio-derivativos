// src/components/remotion/embutidos/EmbutidosPlayerLoader.tsx
"use client";

import dynamic from "next/dynamic";

const EmbutidosPlayer = dynamic(
  () => import("./EmbutidosPlayer").then((m) => ({ default: m.EmbutidosPlayer })),
  { ssr: false },
);

export function EmbutidosPlayerLoader() {
  return <EmbutidosPlayer />;
}
