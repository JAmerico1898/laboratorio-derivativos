import { ModulePage } from '@/components/landing/module-page';
import { OpcoesPlayerLoader } from '@/components/remotion/opcoes/OpcoesPlayerLoader';

export default function OpcoesPage() {
  return <ModulePage themeId="opcoes" heroPlayer={<OpcoesPlayerLoader />} />;
}
