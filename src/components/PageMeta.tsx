import { useEffect } from 'react';

const SITE_ORIGIN = 'https://skirvita.lt';

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

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
}

/** Updates document title and meta tags for SEO and social previews. */
export function PageMeta({ title, description, path }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('description', description);
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:url', `${SITE_ORIGIN}${path}`, 'property');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertCanonical(`${SITE_ORIGIN}${path}`);
  }, [title, description, path]);

  return null;
}
