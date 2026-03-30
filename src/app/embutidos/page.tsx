import { ModulePage } from '@/components/landing/module-page';
import { EmbutidosPlayerLoader } from '@/components/remotion/embutidos/EmbutidosPlayerLoader';

export default function EmbutidosPage() {
  return <ModulePage themeId="embutidos" heroPlayer={<EmbutidosPlayerLoader />} />;
}
