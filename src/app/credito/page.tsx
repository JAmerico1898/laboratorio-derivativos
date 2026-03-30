import { ModulePage } from '@/components/landing/module-page';
import { CreditoPlayerLoader } from '@/components/remotion/credito/CreditoPlayerLoader';

export default function CreditoPage() {
  return <ModulePage themeId="credito" heroPlayer={<CreditoPlayerLoader />} />;
}
