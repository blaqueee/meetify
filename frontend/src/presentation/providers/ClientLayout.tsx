'use client';

import { I18nProvider } from '../../shared/i18n';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
