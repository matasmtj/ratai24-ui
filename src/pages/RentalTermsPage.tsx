import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/useLanguage';

export function RentalTermsPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('rentalTermsTitle')}</h1>
          <p className="text-gray-700">Šios sąlygos taikomos rezervuojant ir nuomojant automobilius per Ratai24.</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Rezervacija</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Automobilį galite rezervuoti internetu, telefonu ar el. paštu.</li>
            <li>Rezervacijai patvirtinti gali būti imamas 50 Eur avansas; jis įskaičiuojamas į nuomos kainą ir negrąžinamas, jei neatvykstama ar atšaukiama po patvirtinimo.</li>
            <li>Galutinis užsakymo patvirtinimas laikomas sudaryta nuomos sutartimi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Dokumentai</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Privalomi: galiojantis vairuotojo pažymėjimas ir asmens tapatybės dokumentas (pasas arba asmens tapatybės kortelė).</li>
            <li>Minimalus vairavimo stažas – 2 metai. Jaunesni ar mažesnį stažą turintys vairuotojai gali būti nepriimami arba taikomas papildomas mokestis.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Apmokėjimas ir užstatas</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Nuoma apmokama pavedimu iki automobilio pasiėmimo arba kortele atsiimant.</li>
            <li>Užstatas: 800 Eur (standartinė atsakomybė), 400 Eur arba 0 Eur – priklausomai nuo pasirinkto draudimo paketo.</li>
            <li>Pasirinkus 0 Eur franšizę, užstatas gali būti nerenkamas; paketo kaina apskaičiuojama rezervacijos metu.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">4. Papildomas vairuotojas</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Automobilį gali vairuoti tik sutartyje nurodyti vairuotojai.</li>
            <li>Papildomas vairuotojas: 5 Eur/parai. Būtina iš anksto registruoti ir pateikti dokumentus.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Draudimas</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Automobiliai apdrausti KASKO ir TPVCA. Standartinė franšizė – 800 Eur; galima rinktis 400 Eur arba 0 Eur atsakomybės paketą.</li>
            <li>Apie bet kokį eismo įvykį, žalą ar incidentą praneškite per 1 kalendorinę dieną; nepranešus draudimas gali negalioti.</li>
            <li>Praradus raktus ar dokumentus taikomas 200 Eur mokestis. Raktai ir dokumentai nedraudžiami.</li>
            <li>Draudimas negalioja važiuojant bekelėje, sporto renginiuose, mokant vairuoti ar pažeidžiant sutartį.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Atsakomybė vagystės ar avarijos atveju</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Nuomininko atsakomybė ribojama pasirinkto paketo franšize (800 / 400 / 0 Eur), jei laikomasi sutarties ir pranešimo tvarkos.</li>
            <li>Vagystės atveju būtina grąžinti raktus ir dokumentus; jų negrąžinus atsakomybė gali būti neribojama.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">7. Rida ir kelionės</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Lietuvoje rida neribojama.</li>
            <li>Kelionėms į užsienį: 300 km/parą (keleiviniams mikroautobusams – 500 km/parą), skaičiuojama per visą nuomos laikotarpį (pvz., 10 parų = 3000 km).</li>
            <li>Viršijus limitą: 0,15 Eur/km naujiems automobiliams, 0,10 Eur/km kitiems.</li>
            <li>Kelionės už LT ribų galimos tik su iš anksto suderintu automobiliu, kuriam galioja gamintojo garantija; senesniems automobiliams gali būti taikomos papildomos sąlygos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">8. Techninė pagalba</h2>
          <p className="text-gray-700">Teikiama 24/7 techninė pagalba kelyje visoje Europoje pagal draudimo sąlygas.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">9. Kuras</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Automobilis išduodamas su pilnu baku ir turi būti grąžintas su pilnu baku.</li>
            <li>Už trūkstamą kurą taikomas sutartyje nurodytas tarifas, gali būti taikomas aptarnavimo mokestis.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">10. Neatvykimas ir atšaukimas</h2>
          <p className="text-gray-700">Neatvykus ar atšaukus po patvirtinimo rezervacijos mokestis (50 Eur) negrąžinamas.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">11. Grąžinimas ir vėlavimas</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Vėluojant grąžinti ir nesuderinus iš anksto, taikomas 10 Eur/val. mokestis.</li>
            <li>Vėluojant daugiau kaip 3 val., skaičiuojamas papildomos paros mokestis.</li>
            <li>Automobilio paėmimas ar grąžinimas nedarbo valandomis galimas tik iš anksto suderinus; taikomas papildomas mokestis.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">12. Nenumatytos aplinkybės</h2>
          <p className="text-gray-700">Esant force majeure (pvz., techninis gedimas, autoįvykis), pasiliekame teisę atšaukti ar pakeisti rezervaciją, apie tai iš anksto informavę klientą ir pasiūlę galimus sprendimus.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">13. Kiti įsipareigojimai</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Laikykitės kelių eismo taisyklių ir gamintojo rekomendacijų.</li>
            <li>Nenaudokite automobilio bekelėje, varžybose, mokant vairuoti ar kitais neleistinais tikslais.</li>
            <li>Apie gedimus ar įvykius informuokite nedelsdami – tai padeda išvengti papildomų nuostolių.</li>
          </ul>
        </section>

        <p className="text-sm text-gray-600">Pastaba: konkrečios kainos, nuolaidos ir papildomos paslaugos gali būti nustatomos individualioje sutartyje ar užsakyme.</p>
      </div>
    </Layout>
  );
}
