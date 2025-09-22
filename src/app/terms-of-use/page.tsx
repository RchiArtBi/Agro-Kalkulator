import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Warunki Użytkowania Aplikacji AgroKalkulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z aplikacji webowej
              AgroKalkulator (zwanej dalej &quot;Aplikacją&quot;), której celem jest
              umożliwienie szacowania kosztów transportu maszyn rolniczych oraz
              związanych z nimi usług dodatkowych.
            </p>
            <p>
              Korzystanie z Aplikacji jest dobrowolne i oznacza akceptację
              niniejszych warunków.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">2. Charakter kalkulacji</h2>
            <p>
              Wszystkie kalkulacje i wyceny generowane przez Aplikację mają
              charakter wyłącznie szacunkowy i informacyjny. Nie stanowią one
              oferty handlowej w rozumieniu art. 66 §1 Kodeksu Cywilnego.
            </p>
            <p>
              Przedstawione koszty są symulacją opartą na wprowadzonych danych
              (np. stawki za kilometr, ceny usług dodatkowych) i mogą różnić
              się od ostatecznej, wiążącej wyceny przedstawionej przez dostawcę
              usługi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">3. Odpowiedzialność</h2>
            <p>
              Twórcy i operatorzy Aplikacji nie ponoszą żadnej
              odpowiedzialności za decyzje biznesowe, finansowe lub jakiekolwiek
              inne podjęte na podstawie wyników uzyskanych z Aplikacji.
            </p>
            <p>
              Użytkownik korzysta z Aplikacji na własne ryzyko. Nie gwarantujemy
              nieprzerwanego i bezbłędnego działania Aplikacji i zastrzegamy
              sobie prawo do przerw technicznych lub modyfikacji jej
              funkcjonalności.
            </p>
             <p>
              Nie ponosimy odpowiedzialności za poprawność, aktualność i kompletność
              danych wprowadzonych do systemu w panelu administracyjnym. Za weryfikację
              stawek i kosztów odpowiada administrator systemu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Prawa autorskie</h2>
            <p>
              Układ graficzny, kod źródłowy oraz treści informacyjne Aplikacji
              są chronione prawem autorskim i stanowią własność jej twórców.
              Jakiekolwiek kopiowanie, modyfikowanie lub rozpowszechnianie ich
              bez zgody jest zabronione.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. Postanowienia końcowe</h2>
            <p>
              Zastrzegamy sobie prawo do zmiany niniejszych warunków w dowolnym
              momencie. Zmiany wchodzą w życie z chwilą ich opublikowania na
              tej stronie.
            </p>
            <p>
              W sprawach nieuregulowanych niniejszym regulaminem zastosowanie
              mają odpowiednie przepisy prawa polskiego.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
