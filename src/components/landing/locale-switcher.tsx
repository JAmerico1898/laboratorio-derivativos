"use client";

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations('locale');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const handleSwitch = () => {
    const nextLocale = currentLocale === 'pt' ? 'en' : 'pt';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={handleSwitch}
      title={t('label')}
      className={`px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer ${className ?? ''}`}
    >
      {t('switch')}
    </button>
  );
}
