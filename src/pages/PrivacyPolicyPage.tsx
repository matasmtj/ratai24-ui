import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/useLanguage';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts';
import { legalPagesApi } from '../api/legalPages';

type PolicyContent = {
  intro: string;
  sections: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
};

export function PrivacyPolicyPage() {
  const { t, language } = useLanguage();
  const { data: contact } = useQuery({
    queryKey: ['contact-info'],
    queryFn: contactsApi.get,
  });
  const contactEmail = contact?.email?.trim() || 'info@ratai24.lt';

  const contentByLanguage: Record<'lt' | 'en' | 'ru', PolicyContent> = {
    lt: {
      intro:
        'Ši privatumo politika paaiškina, kaip "Ratai24" renka, naudoja ir saugo jūsų asmens duomenis, kai naudojatės mūsų svetaine, paskyra ir paslaugomis.',
      sections: [
        {
          title: '1. Duomenų valdytojas',
          paragraphs: [
            'Duomenų valdytojas: Ratai24 (juridinio asmens rekvizitai gali būti pateikti sutartyje). Norėdami įgyvendinti savo teises, kreipkitės el. paštu {email}.',
          ],
        },
        {
          title: '2. Renkami duomenys',
          bullets: [
            'Paskyros duomenys: el. paštas, slaptažodis (užšifruotas), vardas, pavardė, telefono numeris.',
            'Rezervacijų ir sutarčių duomenys: pasirinktas automobilis, nuomos laikotarpis, kainos, mokėjimai, grąžinimo informacija.',
            'Naršymo duomenys: IP adresas, naršyklės informacija, veiklos žurnalai, slapukai ar panašios technologijos, reikalingos funkcionalumui ir analitikai.',
            'Komunikacijos duomenys: užklausos, susirašinėjimas el. paštu ar telefonu.',
          ],
        },
        {
          title: '3. Duomenų naudojimo tikslai',
          bullets: [
            'Paskyros kūrimui ir autentifikavimui.',
            'Rezervacijų administravimui, sutarčių vykdymui ir klientų aptarnavimui.',
            'Mokėjimų administravimui, apskaitai ir teisinių įsipareigojimų vykdymui.',
            'Saugumo užtikrinimui, sukčiavimo prevencijai ir paslaugų kokybei gerinti.',
            'Su jūsų sutikimu - naujienlaiškiams ar pasiūlymams (galite bet kada atsisakyti).',
          ],
        },
        {
          title: '4. Teisiniai pagrindai',
          paragraphs: [
            'Duomenis tvarkome pagal BDAR 6 str.: sutarties vykdymas (nuoma, rezervacijos), teisinė prievolė (apskaita), teisėtas interesas (svetainės saugumas, paslaugų tobulinimas), sutikimas (rinkodara, neprivalomi slapukai).',
          ],
        },
        {
          title: '5. Duomenų saugojimas',
          paragraphs: [
            'Duomenis saugome tik tiek, kiek reikia tikslams pasiekti: sutartiniai ir apskaitos duomenys - pagal teisės aktų reikalavimus; paskyros duomenys - kol naudojatės paslauga; slapukų duomenys - pagal jų galiojimo laiką.',
          ],
        },
        {
          title: '6. Duomenų gavėjai',
          paragraphs: [
            'Duomenys gali būti perduodami paslaugų teikėjams (IT infrastruktūra, el. pašto paslaugos, mokėjimų paslaugos), laikantis duomenų apsaugos reikalavimų ir tik tiek, kiek būtina funkcionalumui užtikrinti. Duomenų neperduodame už ES/EEE ribų, išskyrus atvejus, kai taikomos BDAR numatytos apsaugos priemonės.',
          ],
        },
        {
          title: '7. Jūsų teisės',
          bullets: [
            'Gauti informaciją apie duomenų tvarkymą.',
            'Susipažinti su savo duomenimis ir gauti jų kopiją.',
            'Reikalauti ištaisyti netikslius duomenis.',
            'Reikalauti ištrinti duomenis, kai jie nebereikalingi ar tvarkomi neteisėtai.',
            'Apriboti duomenų tvarkymą arba nesutikti su juo, kai tvarkoma teisėtu interesu.',
            'Perkelti duomenis, kai tvarkoma automatizuotai pagal sutikimą ar sutartį.',
            'Bet kada atšaukti sutikimą, kai duomenys tvarkomi sutikimo pagrindu.',
          ],
          paragraphs: [
            'Teises galite įgyvendinti susisiekę el. paštu {email}. Jei manote, kad jūsų teisės pažeistos, turite teisę kreiptis į Valstybinę duomenų apsaugos inspekciją.',
          ],
        },
        {
          title: '8. Slapukai',
          paragraphs: [
            'Naudojame būtinus slapukus svetainės veikimui ir analitinius slapukus paslaugų kokybei gerinti. Galite valdyti neprivalomus slapukus naršyklės nustatymuose. Būtinų slapukų išjungimas gali apriboti svetainės veikimą.',
          ],
        },
        {
          title: '9. Saugumas',
          paragraphs: [
            'Taikome technines ir organizacines priemones (šifravimas, prieigos kontrolė, žurnalai), siekdami apsaugoti duomenis nuo neteisėtos prieigos, praradimo ar atskleidimo. Visada naudokite stiprų slaptažodį ir nesidalinkite prisijungimo duomenimis.',
          ],
        },
        {
          title: '10. Kontaktai ir atnaujinimai',
          paragraphs: [
            'Kilus klausimų dėl privatumo politikos ar duomenų tvarkymo, rašykite el. paštu {email}. Ši politika gali būti atnaujinama; naujausia versija skelbiama šiame puslapyje.',
          ],
        },
      ],
    },
    en: {
      intro:
        'This Privacy Policy explains how "Ratai24" collects, uses, and protects your personal data when you use our website, account, and services.',
      sections: [
        {
          title: '1. Data controller',
          paragraphs: [
            'Data controller: Ratai24 (legal entity details may be provided in the rental agreement). To exercise your rights, contact us at {email}.',
          ],
        },
        {
          title: '2. Data we collect',
          bullets: [
            'Account data: email address, password (encrypted), first name, last name, phone number.',
            'Reservation and contract data: selected vehicle, rental period, prices, payments, return information.',
            'Browsing data: IP address, browser information, activity logs, cookies or similar technologies required for functionality and analytics.',
            'Communication data: inquiries and correspondence by email or phone.',
          ],
        },
        {
          title: '3. Purposes of data use',
          bullets: [
            'Account creation and authentication.',
            'Reservation administration, contract performance, and customer support.',
            'Payment administration, accounting, and compliance with legal obligations.',
            'Security, fraud prevention, and service quality improvement.',
            'With your consent - newsletters or offers (you may opt out at any time).',
          ],
        },
        {
          title: '4. Legal basis',
          paragraphs: [
            'We process data under GDPR Article 6: contract performance (rental, reservations), legal obligation (accounting), legitimate interest (website security, service improvement), consent (marketing, non-essential cookies).',
          ],
        },
        {
          title: '5. Data retention',
          paragraphs: [
            'We retain personal data only as long as needed to achieve the purposes: contractual and accounting data - in accordance with legal requirements; account data - while you use the service; cookie data - according to cookie retention periods.',
          ],
        },
        {
          title: '6. Data recipients',
          paragraphs: [
            'Data may be shared with service providers (IT infrastructure, email services, payment services) in compliance with data protection requirements and only to the extent necessary to provide functionality. We do not transfer data outside the EU/EEA unless GDPR safeguards are applied.',
          ],
        },
        {
          title: '7. Your rights',
          bullets: [
            'To receive information about data processing.',
            'To access your personal data and obtain a copy.',
            'To request correction of inaccurate data.',
            'To request deletion where data is no longer needed or processed unlawfully.',
            'To restrict processing or object when processing is based on legitimate interest.',
            'To data portability where processing is automated based on consent or contract.',
            'To withdraw consent at any time where processing is based on consent.',
          ],
          paragraphs: [
            'You can exercise these rights by contacting us at {email}. If you believe your rights are violated, you have the right to lodge a complaint with the State Data Protection Inspectorate.',
          ],
        },
        {
          title: '8. Cookies',
          paragraphs: [
            'We use essential cookies for website operation and analytical cookies to improve service quality. You can manage non-essential cookies in your browser settings. Disabling essential cookies may limit website functionality.',
          ],
        },
        {
          title: '9. Security',
          paragraphs: [
            'We apply technical and organizational measures (encryption, access control, logging) to protect data from unauthorized access, loss, or disclosure. Always use a strong password and do not share your login credentials.',
          ],
        },
        {
          title: '10. Contacts and updates',
          paragraphs: [
            'If you have questions about this Privacy Policy or data processing, contact us at {email}. This policy may be updated; the latest version is published on this page.',
          ],
        },
      ],
    },
    ru: {
      intro:
        'Настоящая политика конфиденциальности объясняет, как "Ratai24" собирает, использует и защищает ваши персональные данные при использовании сайта, аккаунта и услуг.',
      sections: [
        {
          title: '1. Оператор данных',
          paragraphs: [
            'Оператор персональных данных: Ratai24 (реквизиты юридического лица могут быть указаны в договоре аренды). Для реализации ваших прав свяжитесь с нами по адресу {email}.',
          ],
        },
        {
          title: '2. Какие данные мы собираем',
          bullets: [
            'Данные аккаунта: email, пароль (в зашифрованном виде), имя, фамилия, номер телефона.',
            'Данные бронирования и договора: выбранный автомобиль, период аренды, стоимость, платежи, информация о возврате.',
            'Данные использования сайта: IP-адрес, данные браузера, журналы активности, cookie и похожие технологии для работы и аналитики.',
            'Коммуникационные данные: запросы и переписка по email или телефону.',
          ],
        },
        {
          title: '3. Цели обработки данных',
          bullets: [
            'Создание аккаунта и аутентификация.',
            'Администрирование бронирований, исполнение договора и поддержка клиентов.',
            'Администрирование платежей, бухгалтерский учет и исполнение правовых обязательств.',
            'Обеспечение безопасности, предотвращение мошенничества и улучшение качества услуг.',
            'По вашему согласию - рассылки и предложения (отписаться можно в любое время).',
          ],
        },
        {
          title: '4. Правовые основания',
          paragraphs: [
            'Мы обрабатываем данные в соответствии со ст. 6 GDPR: исполнение договора (аренда, бронирования), правовая обязанность (бухгалтерия), законный интерес (безопасность сайта, улучшение сервиса), согласие (маркетинг, необязательные cookie).',
          ],
        },
        {
          title: '5. Сроки хранения данных',
          paragraphs: [
            'Мы храним данные только столько, сколько необходимо для достижения целей: данные по договорам и бухгалтерии - согласно требованиям законодательства; данные аккаунта - пока вы пользуетесь сервисом; данные cookie - в рамках срока их действия.',
          ],
        },
        {
          title: '6. Получатели данных',
          paragraphs: [
            'Данные могут передаваться поставщикам услуг (IT-инфраструктура, email-сервисы, платежные сервисы) при соблюдении требований по защите данных и только в необходимом для функциональности объеме. Мы не передаем данные за пределы ЕС/ЕЭЗ, если не применяются предусмотренные GDPR меры защиты.',
          ],
        },
        {
          title: '7. Ваши права',
          bullets: [
            'Получать информацию об обработке данных.',
            'Получить доступ к своим данным и копию данных.',
            'Требовать исправления неточных данных.',
            'Требовать удаления данных, если они больше не нужны или обрабатываются незаконно.',
            'Ограничить обработку или возразить против нее, когда обработка основана на законных интересах.',
            'Получить данные для переноса, когда обработка ведется автоматизированно на основе согласия или договора.',
            'Отозвать согласие в любое время, если обработка основана на согласии.',
          ],
          paragraphs: [
            'Вы можете реализовать эти права, написав нам на {email}. Если вы считаете, что ваши права нарушены, вы вправе обратиться в Государственную инспекцию по защите данных.',
          ],
        },
        {
          title: '8. Cookie',
          paragraphs: [
            'Мы используем обязательные cookie для работы сайта и аналитические cookie для улучшения качества сервиса. Необязательные cookie можно настроить в параметрах браузера. Отключение обязательных cookie может ограничить работу сайта.',
          ],
        },
        {
          title: '9. Безопасность',
          paragraphs: [
            'Мы применяем технические и организационные меры (шифрование, контроль доступа, журналирование), чтобы защитить данные от несанкционированного доступа, утраты или разглашения. Используйте надежный пароль и не передавайте данные для входа третьим лицам.',
          ],
        },
        {
          title: '10. Контакты и обновления',
          paragraphs: [
            'По вопросам политики конфиденциальности и обработки данных свяжитесь с нами: {email}. Политика может обновляться; актуальная версия публикуется на этой странице.',
          ],
        },
      ],
    },
  };

  const activeLanguage = language === 'en' || language === 'ru' ? language : 'lt';
  const { data: legalPage } = useQuery({
    queryKey: ['legal-page', 'privacy-policy', activeLanguage],
    queryFn: async () => {
      try {
        return await legalPagesApi.get('privacy-policy', activeLanguage);
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const content = legalPage?.content ?? contentByLanguage[activeLanguage];
  const withEmail = (text: string) => text.replaceAll('{email}', contactEmail);
  /** Email as plain text (no mailto) so it matches body styling and is not link-styled. */
  const renderParagraphWithEmail = (text: string, className = 'text-gray-700') => (
    <p className={className}>{withEmail(text)}</p>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('privacyPolicyTitle')}</h1>
        <p className="text-gray-700">{content.intro}</p>
        {content.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <div key={paragraph}>{renderParagraphWithEmail(paragraph)}</div>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{withEmail(bullet)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </Layout>
  );
}
