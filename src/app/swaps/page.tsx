// src/app/swaps/page.tsx
import { ModulePage } from '@/components/landing/module-page';
import { SwapsPlayerLoader } from '@/components/remotion/swaps/SwapsPlayerLoader';

export default function SwapsPage() {
  return <ModulePage themeId="swaps" heroPlayer={<SwapsPlayerLoader />} />;
}
