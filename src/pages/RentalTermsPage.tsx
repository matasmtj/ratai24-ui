import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/useLanguage';
import { legalPagesApi } from '../api/legalPages';

type TermsContent = {
  intro: string;
  sections: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  note: string;
};

export function RentalTermsPage() {
  const { t, language } = useLanguage();

  const contentByLanguage: Record<'lt' | 'en' | 'ru', TermsContent> = {
    lt: {
      intro: 'Šios sąlygos taikomos rezervuojant ir nuomojant automobilius per Ratai24.',
      sections: [
        {
          title: '1. Rezervacija',
          bullets: [
            'Automobilį galite rezervuoti internetu, telefonu ar el. paštu.',
            'Rezervacijai patvirtinti gali būti imamas 50 Eur avansas; jis įskaičiuojamas į nuomos kainą ir negrąžinamas, jei neatvykstama ar atšaukiama po patvirtinimo.',
            'Galutinis užsakymo patvirtinimas laikomas sudaryta nuomos sutartimi.',
          ],
        },
        {
          title: '2. Dokumentai',
          bullets: [
            'Privalomi: galiojantis vairuotojo pažymėjimas ir asmens tapatybės dokumentas (pasas arba asmens tapatybės kortelė).',
            'Minimalus vairavimo stažas – 2 metai. Jaunesni ar mažesnį stažą turintys vairuotojai gali būti nepriimami arba taikomas papildomas mokestis.',
          ],
        },
        {
          title: '3. Apmokėjimas ir užstatas',
          bullets: [
            'Nuoma apmokama pavedimu iki automobilio pasiėmimo arba kortele atsiimant.',
            'Užstatas: 800 Eur (standartinė atsakomybė), 400 Eur arba 0 Eur – priklausomai nuo pasirinkto draudimo paketo.',
            'Pasirinkus 0 Eur franšizę, užstatas gali būti nerenkamas; paketo kaina apskaičiuojama rezervacijos metu.',
          ],
        },
        {
          title: '4. Papildomas vairuotojas',
          bullets: [
            'Automobilį gali vairuoti tik sutartyje nurodyti vairuotojai.',
            'Papildomas vairuotojas: 5 Eur/parai. Būtina iš anksto registruoti ir pateikti dokumentus.',
          ],
        },
        {
          title: '5. Draudimas',
          bullets: [
            'Automobiliai apdrausti KASKO ir TPVCA. Standartinė franšizė – 800 Eur; galima rinktis 400 Eur arba 0 Eur atsakomybės paketą.',
            'Apie bet kokį eismo įvykį, žalą ar incidentą praneškite per 1 kalendorinę dieną; nepranešus draudimas gali negalioti.',
            'Praradus raktus ar dokumentus taikomas 200 Eur mokestis. Raktai ir dokumentai nedraudžiami.',
            'Draudimas negalioja važiuojant bekelėje, sporto renginiuose, mokant vairuoti ar pažeidžiant sutartį.',
          ],
        },
        {
          title: '6. Atsakomybė vagystės ar avarijos atveju',
          bullets: [
            'Nuomininko atsakomybė ribojama pasirinkto paketo franšize (800 / 400 / 0 Eur), jei laikomasi sutarties ir pranešimo tvarkos.',
            'Vagystės atveju būtina grąžinti raktus ir dokumentus; jų negrąžinus atsakomybė gali būti neribojama.',
          ],
        },
        {
          title: '7. Rida ir kelionės',
          bullets: [
            'Lietuvoje rida neribojama.',
            'Kelionėms į užsienį: 300 km/parą (keleiviniams mikroautobusams – 500 km/parą), skaičiuojama per visą nuomos laikotarpį (pvz., 10 parų = 3000 km).',
            'Viršijus limitą: 0,15 Eur/km naujiems automobiliams, 0,10 Eur/km kitiems.',
            'Kelionės už LT ribų galimos tik su iš anksto suderintu automobiliu, kuriam galioja gamintojo garantija; senesniems automobiliams gali būti taikomos papildomos sąlygos.',
          ],
        },
        {
          title: '8. Techninė pagalba',
          paragraphs: ['Teikiama 24/7 techninė pagalba kelyje visoje Europoje pagal draudimo sąlygas.'],
        },
        {
          title: '9. Kuras',
          bullets: [
            'Automobilis išduodamas su pilnu baku ir turi būti grąžintas su pilnu baku.',
            'Už trūkstamą kurą taikomas sutartyje nurodytas tarifas, gali būti taikomas aptarnavimo mokestis.',
          ],
        },
        {
          title: '10. Neatvykimas ir atšaukimas',
          paragraphs: ['Neatvykus ar atšaukus po patvirtinimo rezervacijos mokestis (50 Eur) negrąžinamas.'],
        },
        {
          title: '11. Grąžinimas ir vėlavimas',
          bullets: [
            'Vėluojant grąžinti ir nesuderinus iš anksto, taikomas 10 Eur/val. mokestis.',
            'Vėluojant daugiau kaip 3 val., skaičiuojamas papildomos paros mokestis.',
            'Automobilio paėmimas ar grąžinimas nedarbo valandomis galimas tik iš anksto suderinus; taikomas papildomas mokestis.',
          ],
        },
        {
          title: '12. Nenumatytos aplinkybės',
          paragraphs: [
            'Esant force majeure (pvz., techninis gedimas, autoįvykis), pasiliekame teisę atšaukti ar pakeisti rezervaciją, apie tai iš anksto informavę klientą ir pasiūlę galimus sprendimus.',
          ],
        },
        {
          title: '13. Kiti įsipareigojimai',
          bullets: [
            'Laikykitės kelių eismo taisyklių ir gamintojo rekomendacijų.',
            'Nenaudokite automobilio bekelėje, varžybose, mokant vairuoti ar kitais neleistinais tikslais.',
            'Apie gedimus ar įvykius informuokite nedelsdami – tai padeda išvengti papildomų nuostolių.',
          ],
        },
      ],
      note: 'Pastaba: konkrečios kainos, nuolaidos ir papildomos paslaugos gali būti nustatomos individualioje sutartyje ar užsakyme.',
    },
    en: {
      intro: 'These terms apply when reserving and renting vehicles through Ratai24.',
      sections: [
        {
          title: '1. Reservation',
          bullets: [
            'You may reserve a vehicle online, by phone, or by email.',
            'A EUR 50 advance payment may be required to confirm a reservation; it is included in the rental price and is non-refundable in case of no-show or cancellation after confirmation.',
            'Final reservation confirmation is treated as conclusion of the rental agreement.',
          ],
        },
        {
          title: '2. Documents',
          bullets: [
            'Required: valid driving licence and valid identity document (passport or ID card).',
            'Minimum driving experience is 2 years. Drivers who are younger or have less experience may be refused or subject to an additional fee.',
          ],
        },
        {
          title: '3. Payment and deposit',
          bullets: [
            'Rental is paid by bank transfer before pickup or by card at pickup.',
            'Deposit: EUR 800 (standard liability), EUR 400, or EUR 0 - depending on the selected insurance package.',
            'If a EUR 0 excess package is selected, the deposit may be waived; package price is calculated during reservation.',
          ],
        },
        {
          title: '4. Additional driver',
          bullets: [
            'Only drivers listed in the agreement may drive the vehicle.',
            'Additional driver fee: EUR 5/day. Registration and document submission are required in advance.',
          ],
        },
        {
          title: '5. Insurance',
          bullets: [
            'Vehicles are covered by CASCO and third-party liability insurance. Standard excess is EUR 800; EUR 400 or EUR 0 liability packages may be selected.',
            'Any accident, damage, or incident must be reported within 1 calendar day; otherwise insurance coverage may be invalid.',
            'Loss of keys or documents is subject to a EUR 200 fee. Keys and documents are not insured.',
            'Insurance does not apply in off-road use, sports events, driving instruction, or other breach-of-contract situations.',
          ],
        },
        {
          title: '6. Liability in case of theft or accident',
          bullets: [
            'Renter liability is limited to the selected package excess (EUR 800 / 400 / 0), provided contractual and reporting obligations are met.',
            'In case of theft, keys and documents must be returned; failure to return them may remove liability limits.',
          ],
        },
        {
          title: '7. Mileage and cross-border travel',
          bullets: [
            'Mileage is unlimited within Lithuania.',
            'For travel abroad: 300 km/day (500 km/day for passenger vans), calculated over the entire rental period (e.g. 10 days = 3000 km).',
            'Excess mileage fee: EUR 0.15/km for newer vehicles, EUR 0.10/km for others.',
            'Trips outside Lithuania are allowed only with a vehicle approved in advance and covered by manufacturer warranty; additional conditions may apply to older vehicles.',
          ],
        },
        {
          title: '8. Roadside assistance',
          paragraphs: ['24/7 roadside assistance is available across Europe under the insurance terms.'],
        },
        {
          title: '9. Fuel',
          bullets: [
            'The vehicle is handed over with a full tank and must be returned with a full tank.',
            'Missing fuel is charged at the rate defined in the agreement; a service fee may apply.',
          ],
        },
        {
          title: '10. No-show and cancellation',
          paragraphs: ['If you do not arrive or cancel after confirmation, the reservation fee (EUR 50) is not refunded.'],
        },
        {
          title: '11. Return and delay',
          bullets: [
            'For delayed return without prior agreement, a fee of EUR 10/hour applies.',
            'If delay exceeds 3 hours, an additional full-day charge applies.',
            'Pickup or return outside business hours is possible only by prior agreement and may incur an additional fee.',
          ],
        },
        {
          title: '12. Force majeure',
          paragraphs: [
            'In case of force majeure (e.g. technical failure, traffic accident), we reserve the right to cancel or change a reservation after informing the client in advance and proposing available solutions.',
          ],
        },
        {
          title: '13. Other obligations',
          bullets: [
            'Follow road traffic rules and manufacturer recommendations.',
            'Do not use the vehicle off-road, in competitions, for driving instruction, or for other prohibited purposes.',
            'Report malfunctions or incidents immediately to help prevent additional losses.',
          ],
        },
      ],
      note: 'Note: specific prices, discounts, and additional services may be defined in an individual agreement or booking.',
    },
    ru: {
      intro: 'Настоящие условия применяются при бронировании и аренде автомобилей через Ratai24.',
      sections: [
        {
          title: '1. Бронирование',
          bullets: [
            'Автомобиль можно забронировать онлайн, по телефону или по email.',
            'Для подтверждения бронирования может взиматься аванс 50 EUR; он включается в стоимость аренды и не возвращается при неявке или отмене после подтверждения.',
            'Окончательное подтверждение бронирования считается заключением договора аренды.',
          ],
        },
        {
          title: '2. Документы',
          bullets: [
            'Обязательно: действующее водительское удостоверение и документ, удостоверяющий личность (паспорт или ID-карта).',
            'Минимальный стаж вождения - 2 года. Более молодые водители или водители с меньшим стажем могут быть не приняты либо для них может применяться дополнительная плата.',
          ],
        },
        {
          title: '3. Оплата и депозит',
          bullets: [
            'Оплата аренды производится банковским переводом до получения автомобиля либо картой при получении.',
            'Депозит: 800 EUR (стандартная ответственность), 400 EUR или 0 EUR - в зависимости от выбранного страхового пакета.',
            'При выборе пакета с франшизой 0 EUR депозит может не взиматься; стоимость пакета рассчитывается при бронировании.',
          ],
        },
        {
          title: '4. Дополнительный водитель',
          bullets: [
            'Управлять автомобилем могут только водители, указанные в договоре.',
            'Дополнительный водитель: 5 EUR/сутки. Требуется предварительная регистрация и предоставление документов.',
          ],
        },
        {
          title: '5. Страхование',
          bullets: [
            'Автомобили застрахованы по КАСКО и ОСАГО. Стандартная франшиза - 800 EUR; можно выбрать пакеты ответственности 400 EUR или 0 EUR.',
            'О любом ДТП, повреждении или инциденте необходимо сообщить в течение 1 календарного дня; при несообщении страхование может не действовать.',
            'За утерю ключей или документов взимается плата 200 EUR. Ключи и документы не страхуются.',
            'Страхование не действует при езде вне дорог, участии в спортивных мероприятиях, обучении вождению или нарушении условий договора.',
          ],
        },
        {
          title: '6. Ответственность при угоне или ДТП',
          bullets: [
            'Ответственность арендатора ограничена франшизой выбранного пакета (800 / 400 / 0 EUR) при соблюдении условий договора и порядка уведомления.',
            'При угоне необходимо вернуть ключи и документы; при их невозврате ответственность может стать неограниченной.',
          ],
        },
        {
          title: '7. Пробег и поездки',
          bullets: [
            'По Литве пробег не ограничен.',
            'Для поездок за границу: 300 км/сутки (500 км/сутки для пассажирских микроавтобусов), расчет по всему сроку аренды (например, 10 суток = 3000 км).',
            'При превышении лимита: 0,15 EUR/км для новых автомобилей, 0,10 EUR/км для остальных.',
            'Поездки за пределы Литвы возможны только на заранее согласованном автомобиле с действующей гарантией производителя; для более старых автомобилей могут применяться дополнительные условия.',
          ],
        },
        {
          title: '8. Техническая помощь',
          paragraphs: ['Круглосуточная техническая помощь 24/7 предоставляется по всей Европе в соответствии с условиями страхования.'],
        },
        {
          title: '9. Топливо',
          bullets: [
            'Автомобиль выдается с полным баком и должен быть возвращен с полным баком.',
            'Недостающее топливо оплачивается по тарифу, указанному в договоре; может взиматься сервисный сбор.',
          ],
        },
        {
          title: '10. Неявка и отмена',
          paragraphs: ['При неявке или отмене после подтверждения сбор за бронирование (50 EUR) не возвращается.'],
        },
        {
          title: '11. Возврат и опоздание',
          bullets: [
            'При задержке возврата без предварительного согласования применяется плата 10 EUR/час.',
            'При задержке более 3 часов начисляется стоимость дополнительных суток.',
            'Получение или возврат автомобиля вне рабочего времени возможны только по предварительному согласованию; применяется дополнительная плата.',
          ],
        },
        {
          title: '12. Непредвиденные обстоятельства',
          paragraphs: [
            'При форс-мажоре (например, техническая неисправность, ДТП) мы оставляем за собой право отменить или изменить бронирование, предварительно уведомив клиента и предложив возможные решения.',
          ],
        },
        {
          title: '13. Прочие обязательства',
          bullets: [
            'Соблюдайте правила дорожного движения и рекомендации производителя.',
            'Не используйте автомобиль вне дорог, в соревнованиях, для обучения вождению или в иных запрещенных целях.',
            'Немедленно сообщайте о неисправностях или происшествиях - это помогает избежать дополнительных убытков.',
          ],
        },
      ],
      note: 'Примечание: конкретные цены, скидки и дополнительные услуги могут определяться в индивидуальном договоре или заказе.',
    },
  };

  const activeLanguage = language === 'en' || language === 'ru' ? language : 'lt';
  const { data: legalPage } = useQuery({
    queryKey: ['legal-page', 'rental-terms', activeLanguage],
    queryFn: async () => {
      try {
        return await legalPagesApi.get('rental-terms', activeLanguage);
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const content = legalPage?.content ?? contentByLanguage[activeLanguage];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('rentalTermsTitle')}</h1>
          <p className="text-gray-700">{content.intro}</p>
        </header>

        {content.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-gray-700">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-sm text-gray-600">{content.note}</p>
      </div>
    </Layout>
  );
}
