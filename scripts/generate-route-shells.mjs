/**
 * Post-build: generate per-route index.html shells with correct SEO meta and
 * static crawlable content (no Puppeteer required).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const SITE_ORIGIN = 'https://skirvita.lt';

/** Page groups share hreflang alternates. */
const PAGE_GROUPS = [
  {
    alternates: {
      lt: {
        path: '/lt',
        title: 'Skirvita – mikroautobusų ir lengvųjų automobilių nuoma',
        description:
          'Skirvita – greita, paprasta ir patikima automobilių nuoma. Peržiūrėkite katalogą, rezervuokite online ir keliaukite be rūpesčių.',
        body: '<h1>Mikroautobusų ir lengvųjų automobilių nuoma</h1>',
      },
      en: {
        path: '/en',
        title: 'Skirvita – minibus and car rental',
        description:
          'Fast, simple and reliable car rental. Browse our catalog, book online, and hit the road with confidence.',
        body: '<h1>Minibus and car rental</h1>',
      },
      ru: {
        path: '/ru',
        title: 'Skirvita – аренда микроавтобусов и легковых автомобилей',
        description:
          'Быстрая, простая и надёжная аренда автомобилей. Просмотрите каталог, забронируйте онлайн и отправляйтесь в путь.',
        body: '<h1>Аренда микроавтобусов и легковых автомобилей</h1>',
      },
    },
  },
  {
    alternates: {
      lt: {
        path: '/lt/nuomoti-automobilius',
        title: 'Automobilių nuoma – Skirvita',
        description:
          'Išnuomokite mikroautobusą ar lengvąjį automobilį. Platus pasirinkimas, aiškios kainos, rezervacija online.',
        body: '<h1>Automobilių katalogas</h1>',
      },
      en: {
        path: '/en/rent-cars',
        title: 'Car rental – Skirvita',
        description: 'Rent a minibus or car with clear pricing and online booking.',
        body: '<h1>Car catalog</h1>',
      },
      ru: {
        path: '/ru/arenda-avto',
        title: 'Аренда автомобилей – Skirvita',
        description: 'Арендуйте микроавтобус или легковой автомобиль с понятными ценами и онлайн-бронированием.',
        body: '<h1>Каталог автомобилей</h1>',
      },
    },
  },
  {
    alternates: {
      lt: {
        path: '/lt/parduodami-automobiliai',
        title: 'Automobilių pardavimas – Skirvita',
        description:
          'Parduodami automobiliai Lietuvoje: lengvieji, mikroautobusai ir komerciniai modeliai. Peržiūrėkite katalogą, filtruokite pagal miestą ir kainą.',
        body:
          '<h1>Automobilių pardavimo katalogas</h1><p>Skirvita siūlo parduodamus automobilius nuomos ir pardavimo klientams visoje Lietuvoje. Kataloge rasite lengvuosius automobilius, mikroautobusus ir kitus modelius su nuotraukomis, technine informacija ir pardavimo kaina.</p>',
      },
      en: {
        path: '/en/sale-cars',
        title: 'Cars for sale – Skirvita',
        description:
          'Cars for sale in Lithuania: passenger cars, minibuses and commercial vehicles. Browse the catalog, filter by city and price.',
        body:
          '<h1>Car Sale Catalog</h1><p>Skirvita lists vehicles available for purchase alongside our rental fleet across Lithuania. Browse photos, specifications and sale prices.</p>',
      },
      ru: {
        path: '/ru/prodazha-avto',
        title: 'Продажа автомобилей – Skirvita',
        description:
          'Автомобили на продажу в Литве: легковые, микроавтобусы и коммерческие модели. Просмотрите каталог, фильтруйте по городу и цене.',
        body:
          '<h1>Каталог продажи автомобилей</h1><p>Skirvita предлагает автомобили для покупки наряду с арендным парком по всей Литве.</p>',
      },
    },
  },
  {
    alternates: {
      lt: {
        path: '/lt/kontaktai',
        title: 'Kontaktai – Skirvita',
        description: 'Susisiekite su Skirvita dėl automobilių nuomos. Adresai, telefonas ir darbo laikas.',
        body: '<h1>Kontaktai</h1>',
      },
      en: {
        path: '/en/contacts',
        title: 'Contacts – Skirvita',
        description: 'Get in touch with Skirvita for car rental. Address, phone, and business hours.',
        body: '<h1>Contacts</h1>',
      },
      ru: {
        path: '/ru/kontakty',
        title: 'Контакты – Skirvita',
        description: 'Свяжитесь с Skirvita по вопросам аренды автомобилей.',
        body: '<h1>Контакты</h1>',
      },
    },
  },
  {
    alternates: {
      lt: {
        path: '/lt/privatumo-politika',
        title: 'Privatumo politika – Skirvita',
        description: 'Skirvita privatumo politika – kaip tvarkome jūsų asmens duomenis.',
        body: '<h1>Privatumo politika</h1>',
      },
      en: {
        path: '/en/privacy-policy',
        title: 'Privacy policy – Skirvita',
        description: 'Skirvita privacy policy – how we handle your personal data.',
        body: '<h1>Privacy policy</h1>',
      },
      ru: {
        path: '/ru/politika-konfidencialnosti',
        title: 'Политика конфиденциальности – Skirvita',
        description: 'Политика конфиденциальности Skirvita.',
        body: '<h1>Политика конфиденциальности</h1>',
      },
    },
  },
  {
    alternates: {
      lt: {
        path: '/lt/nuomos-salygos',
        title: 'Nuomos sąlygos – Skirvita',
        description: 'Automobilių nuomos sąlygos ir taisyklės – Skirvita.',
        body: '<h1>Nuomos sąlygos</h1>',
      },
      en: {
        path: '/en/rental-terms',
        title: 'Rental terms – Skirvita',
        description: 'Car rental terms and conditions – Skirvita.',
        body: '<h1>Rental terms</h1>',
      },
      ru: {
        path: '/ru/usloviya-arendy',
        title: 'Условия аренды – Skirvita',
        description: 'Условия и правила аренды автомобилей – Skirvita.',
        body: '<h1>Условия аренды</h1>',
      },
    },
  },
];

const REGISTER_PAGE = {
  path: '/register',
  title: 'Registruotis – Skirvita',
  description: 'Sukurkite Skirvita paskyrą ir rezervuokite automobilį online.',
  body: '<h1>Registruotis</h1><p>Sukurkite naują paskyrą</p>',
};

function buildHreflangLinks(group, currentPath) {
  const lines = [];
  for (const [lang, meta] of Object.entries(group.alternates)) {
    lines.push(
      `<link rel="alternate" hreflang="${lang}" href="${SITE_ORIGIN}${meta.path}" />`,
    );
  }
  if (group.alternates.lt) {
    lines.push(
      `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${group.alternates.lt.path}" />`,
    );
  }
  return lines.join('\n    ');
}

function buildHtml(template, meta, hreflangHtml) {
  const canonical = `${SITE_ORIGIN}${meta.path}`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
  );
  html = html.replace(
    /<link\s+rel="canonical"[\s\S]*?\/>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${meta.title.replace(/"/g, '&quot;')}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"[\s\S]*?\/>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${meta.title.replace(/"/g, '&quot;')}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
  );

  if (hreflangHtml) {
    html = html.replace('</head>', `    ${hreflangHtml}\n  </head>`);
  }

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${meta.body}</div>`,
  );

  return html;
}

function writeRouteShell(template, meta, hreflangHtml) {
  const html = buildHtml(template, meta, hreflangHtml);
  const segments = meta.path.replace(/^\//, '').split('/');
  const outDir = join(distDir, ...segments);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

for (const group of PAGE_GROUPS) {
  const hreflangHtml = buildHreflangLinks(group);
  for (const meta of Object.values(group.alternates)) {
    writeRouteShell(template, meta, hreflangHtml);
  }
}

writeRouteShell(template, REGISTER_PAGE, null);

console.log(
  `[generate-route-shells] Created ${PAGE_GROUPS.length * 3 + 1} route HTML shells`,
);
