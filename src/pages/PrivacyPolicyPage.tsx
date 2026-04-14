import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/useLanguage';

export function PrivacyPolicyPage() {
  const { t, language } = useLanguage();

  if (language !== 'lt') {
    const isEn = language === 'en';
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('privacyPolicyTitle')}</h1>
          <p className="text-gray-700">
            {isEn
              ? 'This privacy policy explains how Ratai24 collects, uses and protects your personal data when you use our website and services.'
              : 'Эта политика конфиденциальности объясняет, как Ratai24 собирает, использует и защищает ваши персональные данные при использовании сайта и услуг.'}
          </p>
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{isEn ? '1. Data we collect' : '1. Какие данные мы собираем'}</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>{isEn ? 'Account data: email, encrypted password, name, surname, phone.' : 'Данные аккаунта: email, зашифрованный пароль, имя, фамилия, телефон.'}</li>
              <li>{isEn ? 'Rental data: selected car, rental period, price, contract and return information.' : 'Данные аренды: выбранный авто, период аренды, цена, договор и информация о возврате.'}</li>
              <li>{isEn ? 'Technical data: IP, browser details, logs, cookies required for functionality and analytics.' : 'Технические данные: IP, данные браузера, журналы, cookie для работы и аналитики.'}</li>
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{isEn ? '2. Why we process data' : '2. Зачем мы обрабатываем данные'}</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>{isEn ? 'To provide account access, reservations, contracts and customer support.' : 'Для доступа к аккаунту, бронирований, договоров и поддержки.'}</li>
              <li>{isEn ? 'To meet legal obligations (accounting, compliance, fraud prevention).' : 'Для соблюдения юридических требований (бухгалтерия, комплаенс, предотвращение мошенничества).'}</li>
              <li>{isEn ? 'With consent, for optional communication and offers.' : 'С вашего согласия — для дополнительных рассылок и предложений.'}</li>
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{isEn ? '3. Retention and sharing' : '3. Хранение и передача'}</h2>
            <p className="text-gray-700">
              {isEn
                ? 'We keep data only as long as needed for service and legal purposes. Data may be shared with trusted providers (hosting, email, payments) under data protection requirements.'
                : 'Мы храним данные только столько, сколько необходимо для оказания услуг и выполнения закона. Данные могут передаваться доверенным провайдерам (хостинг, email, платежи) при соблюдении требований защиты данных.'}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{isEn ? '4. Your rights' : '4. Ваши права'}</h2>
            <p className="text-gray-700">
              {isEn
                ? 'You can request access, correction, deletion, restriction, objection, portability, and withdrawal of consent. Contact us at info@ratai24.lt.'
                : 'Вы можете запросить доступ, исправление, удаление, ограничение, возражение, переносимость данных и отзыв согласия. Свяжитесь с нами: info@ratai24.lt.'}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{isEn ? '5. Cookies and security' : '5. Cookie и безопасность'}</h2>
            <p className="text-gray-700">
              {isEn
                ? 'We use essential cookies and apply technical/organizational security measures to protect your data.'
                : 'Мы используем обязательные cookie и применяем технические/организационные меры безопасности для защиты ваших данных.'}
            </p>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('privacyPolicyTitle')}</h1>
        <p className="text-gray-700 mb-4">
          Ši privatumo politika paaiškina, kaip „Ratai24“ renka, naudoja ir saugo jūsų asmens
          duomenis, kai naudojatės mūsų svetaine, paskyra ir paslaugomis.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Duomenų valdytojas</h2>
            <p className="text-gray-700">
              Duomenų valdytojas: Ratai24 (juridinio asmens rekvizitai gali būti pateikti sutartyje). Norėdami
              įgyvendinti savo teises, kreipkitės el. paštu <a className="text-primary-600" href="mailto:info@ratai24.lt">info@ratai24.lt</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Renkami duomenys</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Paskyros duomenys: el. paštas, slaptažodis (užšifruotas), vardas, pavardė, telefono numeris.</li>
              <li>Rezervacijų ir sutarčių duomenys: pasirinktas automobilis, nuomos laikotarpis, kainos, mokėjimai, grąžinimo informacija.</li>
              <li>Naršymo duomenys: IP adresas, naršyklės informacija, veiklos žurnalai, slapukai ar panašios technologijos, reikalingos funkcionalumui ir analitikai.</li>
              <li>Komunikacijos duomenys: užklausos, susirašinėjimas el. paštu ar telefonu.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Duomenų naudojimo tikslai</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Paskyros kūrimui ir autentifikavimui.</li>
              <li>Rezervacijų administravimui, sutarčių vykdymui ir klientų aptarnavimui.</li>
              <li>Mokėjimų administravimui, apskaitai ir teisinių įsipareigojimų vykdymui.</li>
              <li>Saugumo užtikrinimui, sukčiavimo prevencijai ir paslaugų kokybei gerinti.</li>
              <li>Su jūsų sutikimu – naujienlaiškiams ar pasiūlymams (galite bet kada atsisakyti).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Teisiniai pagrindai</h2>
            <p className="text-gray-700">
              Duomenis tvarkome pagal BDAR 6 str.: sutarties vykdymas (nuoma, rezervacijos), teisinė prievolė (apskaita),
              teisėtas interesas (svetainės saugumas, paslaugų tobulinimas), sutikimas (rinkodara, neprivalomi slapukai).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Duomenų saugojimas</h2>
            <p className="text-gray-700">
              Duomenis saugome tik tiek, kiek reikia tikslams pasiekti: sutartiniai ir apskaitos duomenys – pagal
              teisės aktų reikalavimus; paskyros duomenys – kol naudojatės paslauga; slapukų duomenys – pagal jų galiojimo laiką.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Duomenų gavėjai</h2>
            <p className="text-gray-700">
              Duomenys gali būti perduodami paslaugų teikėjams (IT infrastruktūra, el. pašto paslaugos, mokėjimų paslaugos),
              laikantis duomenų apsaugos reikalavimų ir tik tiek, kiek būtina funkcionalumui užtikrinti. Duomenų
              neperduodame už ES/EEE ribų, išskyrus atvejus, kai taikomos BDAR numatytos apsaugos priemonės.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Jūsų teisės</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Gauti informaciją apie duomenų tvarkymą.</li>
              <li>Susipažinti su savo duomenimis ir gauti jų kopiją.</li>
              <li>Reikalauti ištaisyti netikslius duomenis.</li>
              <li>Reikalauti ištrinti duomenis, kai jie nebereikalingi ar tvarkomi neteisėtai.</li>
              <li>Apriboti duomenų tvarkymą arba nesutikti su juo, kai tvarkoma teisėtu interesu.</li>
              <li>Perkelti duomenis, kai tvarkoma automatizuotai pagal sutikimą ar sutartį.</li>
              <li>Bet kada atšaukti sutikimą, kai duomenys tvarkomi sutikimo pagrindu.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Teises galite įgyvendinti susisiekę el. paštu <a className="text-primary-600" href="mailto:info@ratai24.lt">info@ratai24.lt</a>. Jei manote, kad jūsų teisės pažeistos, turite teisę kreiptis į Valstybinę duomenų apsaugos inspekciją.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Slapukai</h2>
            <p className="text-gray-700">
              Naudojame būtinus slapukus svetainės veikimui ir analitinius slapukus paslaugų kokybei gerinti. Galite
              valdyti neprivalomus slapukus naršyklės nustatymuose. Būtinų slapukų išjungimas gali apriboti svetainės veikimą.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Saugumas</h2>
            <p className="text-gray-700">
              Taikome technines ir organizacines priemones (šifravimas, prieigos kontrolė, žurnalai) siekdami apsaugoti
              duomenis nuo neteisėtos prieigos, praradimo ar atskleidimo. Visada naudokite stiprų slaptažodį ir
              nesidalinkite prisijungimo duomenimis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Kontaktai ir atnaujinimai</h2>
            <p className="text-gray-700">
              Kilus klausimų dėl privatumo politikos ar duomenų tvarkymo, rašykite el. paštu <a className="text-primary-600" href="mailto:info@ratai24.lt">info@ratai24.lt</a>. Ši politika gali būti atnaujinama; naujausia versija skelbiama šiame puslapyje.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
