import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/useLanguage';

export function PrivacyPolicyPage() {
  const { t } = useLanguage();
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
