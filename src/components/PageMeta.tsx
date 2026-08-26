import { useEffect } from 'react';
import type { Language } from '../i18n/translations';

const SITE_ORIGIN = 'https://skirvita.lt';
const HREFLANG_ATTR = 'data-page-meta-hreflang';

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertHreflang(alternatePaths: Partial<Record<Language, string>>) {
  document.querySelectorAll(`link[rel="alternate"][${HREFLANG_ATTR}]`).forEach((el) => el.remove());

  for (const [lang, path] of Object.entries(alternatePaths)) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = `${SITE_ORIGIN}${path}`;
    link.setAttribute(HREFLANG_ATTR, 'true');
    document.head.appendChild(link);
  }

  if (alternatePaths.lt) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = 'x-default';
    link.href = `${SITE_ORIGIN}${alternatePaths.lt}`;
    link.setAttribute(HREFLANG_ATTR, 'true');
    document.head.appendChild(link);
  }
}

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  alternatePaths?: Partial<Record<Language, string>>;
}

/** Updates document title and meta tags for SEO and social previews. */
export function PageMeta({ title, description, path, alternatePaths }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('description', description);
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:url', `${SITE_ORIGIN}${path}`, 'property');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertCanonical(`${SITE_ORIGIN}${path}`);
    if (alternatePaths) {
      upsertHreflang(alternatePaths);
    }
  }, [title, description, path, alternatePaths]);

  return null;
}
