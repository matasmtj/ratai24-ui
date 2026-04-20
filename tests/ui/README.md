# CarLease UI testai (Selenium IDE)

Failas `carlease.side` yra „Selenium IDE“ projektas, kuriame aprašyti
**20 automatizuotų scenarijų**, dengiančių pagrindinius viešojo sistemos
naudotojo srauto žingsnius – navigaciją, automobilių katalogą,
rezervacijos mygtuko elgseną, apsaugotus maršrutus, prisijungimo ir
registracijos formų validaciją.

Testus galima paleisti dviem būdais: vizualiai per „Selenium IDE“
naršyklės priedą (matoma gyvai, kaip naršyklė atlieka veiksmus) arba
„headless“ režimu per `selenium-side-runner` komandinę eilutę.

## Scenarijų sąrašas

| Nr. | ID | Scenarijaus aprašymas |
|---:|---|---|
|  1 | `t01-home-loads` | Pagrindinis puslapis užkrautas, matoma hero antraštė ir navbar |
|  2 | `t02-nav-home-to-cars` | Paspaudus navbar'o „Automobilių nuoma“ atverstas `/rent-cars` |
|  3 | `t03-nav-home-to-contacts` | Paspaudus „Kontaktai“ atverstas `/contacts` |
|  4 | `t04-nav-logo-back-home` | „Ratai24“ logotipas grąžina į pagrindinį puslapį |
|  5 | `t05-footer-privacy-link` | Footer nuoroda į privatumo politiką veikia |
|  6 | `t06-footer-rental-terms-link` | Footer nuoroda į nuomos sąlygas veikia |
|  7 | `t07-protected-dashboard-redirect` | Neprisijungusį naudotoją `/dashboard` nukreipia į `/login` |
|  8 | `t08-protected-admin-redirect` | Neprisijungusį naudotoją `/admin/cars` nukreipia į `/login` |
|  9 | `t09-cars-catalog-opens` | Nuomos katalogas su paieška, rūšiavimu ir filtrų mygtuku |
| 10 | `t10-cars-search-no-results` | Paieška su nesamu tekstu rodo žinutę „Nerasta automobilių…“ |
| 11 | `t11-cars-advanced-filters-toggle` | Išplėstiniai filtrai išskleidžiami ir suskleidžiami |
| 12 | `t12-cars-filter-fuel-petrol` | Pasirinkus degalų tipą „Benzinas“ pasirodo reset mygtukas |
| 13 | `t13-cars-filter-reset` | „Atstatyti filtrus“ išvalo pritaikytą filtrą |
| 14 | `t14-cars-detail-login-to-book` | Detalių puslapyje „Prisijunkite, kad rezervuotumėte“ nukreipia į `/login` |
| 15 | `t15-login-empty-captcha-error` | Prisijungimas be reCAPTCHA rodo klaidos pranešimą |
| 16 | `t16-login-forgot-password-link` | Nuoroda „Pamiršote slaptažodį?“ veda į `/forgot-password` |
| 17 | `t17-register-password-mismatch` | Skirtingi slaptažodžiai: „Slaptažodžiai nesutampa“ |
| 18 | `t18-register-weak-password` | Per silpnas slaptažodis: „Įvykdykite visus slaptažodžio reikalavimus“ |
| 19 | `t19-register-missing-phone` | Tuščias telefono numeris blokuoja formos pateikimą (HTML5 `required`) |
| 20 | `t20-contacts-page-loads` | Kontaktų puslapis užkrautas, matoma antraštė |

Testai suskirstyti į du rinkinius:

- **Pilnas UI regresinis rinkinys** (`suite-all`) – visi 20 testų.
- **Smoke** (`suite-smoke`) – 6 trumpiausi testai greitam patikrinimui.

## Paleidimas per „Selenium IDE“ priedą (gyvai matoma naršyklė)

1. Įsidiekite „Selenium IDE“ plėtinį į „Chrome“, „Firefox“ arba „Edge“.
2. Paleiskite UI projektą: `npm run dev` (veikia `http://localhost:5173`).
3. Paleiskite „Selenium IDE“ → **Open an existing project…** → pasirinkite
   `tests/ui/carlease.side`.
4. Dešinėje pusėje pasirinkite rinkinį (pvz. **Pilnas UI regresinis
   rinkinys**) ir paspauskite **Run all tests**. Naršyklė atliks
   veiksmus realiu laiku – apačioje esančiame žurnale (angl. *log*)
   kiekviena komanda bus pažymėta kaip *OK* arba *Failed*.

## Paleidimas per CLI

Repozitorijoje yra du CLI paleidikliai.

### Rekomenduojamas: `npm run test:ui`

Paleidžia lokalų skriptą `tests/ui/run-direct.mjs`, kuris perskaito
`carlease.side` projektą ir vykdo testus per `selenium-webdriver` bei
`chromedriver` tiesiogiai (be `selenium-side-runner` tarpinės grandies,
su kuria Windows aplinkoje buvo suderinamumo problemų). Naudojamas
„headless Chrome“ režimas.

```powershell
# Iš ratai24-ui katalogo (backend'as turi veikti `http://localhost:3000`,
# frontend'as `http://localhost:5173`)
npm run test:ui

# Tik konkretus testas pagal ID fragmentą arba pavadinimo dalį
node tests/ui/run-direct.mjs t15

# Kitas bazinis URL
$env:BASE_URL="http://localhost:4173"; npm run test:ui
```

Išvestis pateikia kiekvieno testo rezultatą (`PASS` / `FAIL`) bei
bendrą suvestinę; jei bent vienas testas nepraėjo, proceso išėjimo kodas
yra `1` – tinka CI/CD integracijai.

### Standartinis `selenium-side-runner`

```powershell
npm run test:ui:side-runner
```

arba:

```powershell
npx selenium-side-runner tests/ui/carlease.side --base-url http://localhost:5173
npx selenium-side-runner tests/ui/carlease.side --base-url http://localhost:5173 --filter "Smoke"
```

## Pastaba apie „Google reCAPTCHA“

Prisijungimo, registracijos ir slaptažodžio atkūrimo formose naudojamas
„Google reCAPTCHA“ tikrinimas. Jo žetono automatiniu būdu be rankinio
įsikišimo gauti negalima, todėl šie testai tikrina **formos validaciją,
kuri įvyksta prieš arba vietoj sėkmingo reCAPTCHA patikrinimo**:
slaptažodžių nesutapimą, per silpną slaptažodį, HTML5 `required` lauko
blokavimą ir klaidos pranešimą apie neužbaigtą reCAPTCHA (`t15`).
Pilna registracijos / prisijungimo sėkmės eiga (su reCAPTCHA varnele)
patikrinama rankiniu būdu pagal 3.5 skyriuje pateiktus scenarijus.
