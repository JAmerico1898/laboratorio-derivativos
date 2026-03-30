import { ModulePage } from '@/components/landing/module-page';
import dynamic from 'next/dynamic';

const FuturosPlayer = dynamic(
  () => import("@/components/remotion/futuros/FuturosPlayer").then((m) => ({ default: m.FuturosPlayer })),
  { ssr: false }
);

export default function FuturosPage() {
  return <ModulePage themeId="futuros" heroPlayer={<FuturosPlayer />} />;
}
