import { useEffect } from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { DEFAULT_LANG, isSupportedLang } from '../i18n/routes';

export function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    if (isSupportedLang(lang)) {
      setLanguage(lang);
      document.documentElement.lang = lang;
    }
  }, [lang, setLanguage]);

  if (!isSupportedLang(lang)) {
    return <Navigate to={`/${DEFAULT_LANG}`} replace />;
  }

  return <Outlet />;
}
