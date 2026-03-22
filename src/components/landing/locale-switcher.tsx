"use client";

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { COLORS } from '@/lib/constants';

export function LocaleSwitcher() {
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
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100,
        background: 'none',
        border: `1px solid ${COLORS.accent}60`,
        color: COLORS.accent,
        padding: '5px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.accentDim;
        e.currentTarget.style.borderColor = COLORS.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.borderColor = `${COLORS.accent}60`;
      }}
    >
      {t('switch')}
    </button>
  );
}
