import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { DEFAULT_LANG, getCanonicalRedirectPath, isSupportedLang, stripLangPrefix, SUPPORTED_LANGS } from '../i18n/routes';
import { localizePathSegments, resolveRouteKeyFromSlug } from '../i18n/routeSlugs';
import { PageMeta } from './PageMeta';
import { getSeoTranslationKeys } from '../lib/seo';

export function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const { setLanguage, t } = useLanguage();

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

  const firstSegment = pathWithoutLang.split('/').filter(Boolean)[0] ?? '';
  const routeKey = firstSegment ? resolveRouteKeyFromSlug(firstSegment) : null;
  const seoKeys = getSeoTranslationKeys(routeKey);
  const canonicalPath = `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang.split('?')[0]}`;
  const alternatePaths = Object.fromEntries(
    SUPPORTED_LANGS.map((l) => [l, localizePathSegments(l, pathWithoutLang)]),
  );

  return (
    <>
      <PageMeta
        title={t(seoKeys.title)}
        description={t(seoKeys.description)}
        path={canonicalPath}
        alternatePaths={alternatePaths}
      />
      <Outlet />
    </>
  );
}
