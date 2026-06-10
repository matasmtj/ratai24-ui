import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { DEFAULT_LANG, getCanonicalRedirectPath, isSupportedLang, stripLangPrefix } from '../i18n/routes';

export function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
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

  const { pathWithoutLang } = stripLangPrefix(location.pathname + location.search);
  const canonical = getCanonicalRedirectPath(lang, pathWithoutLang);
  if (canonical && canonical !== location.pathname + location.search) {
    return <Navigate to={canonical} replace />;
  }

  return <Outlet />;
}
