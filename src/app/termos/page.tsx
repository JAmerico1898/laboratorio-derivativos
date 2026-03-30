"use client";

import dynamic from "next/dynamic";
import { ModulePage } from '@/components/landing/module-page';

const TermosPlayer = dynamic(
  () => import("@/components/remotion/termos/TermosPlayer").then((m) => ({ default: m.TermosPlayer })),
  { ssr: false }
);

export default function TermosPage() {
  return <ModulePage themeId="ndf" heroPlayer={<TermosPlayer />} />;
}
