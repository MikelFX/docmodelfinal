import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Podmínky použití — DocThink',
  description: 'Podmínky použití služby DocThink — AI analýza smluv.',
}

export default function TermsPage() {
  return (
    <main style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '48px 24px',
      fontFamily: 'system-ui, sans-serif',
      color: '#e0e0e0',
      background: '#07070d',
      minHeight: '100vh',
      lineHeight: 1.7,
    }}>
      <h1 style={{ color: '#fff', marginBottom: 8 }}>Podmínky použití</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>Poslední aktualizace: 26. 5. 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>1. Provozovatel</h2>
        <p>
          Službu DocThink provozuje individuální projekt. Kontakt: <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a>.
          Používáním služby souhlasíte s těmito podmínkami.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>2. Popis služby</h2>
        <p>
          DocThink je AI nástroj pro analýzu smluv a dokumentů. Služba identifikuje rizikové klauzule, chybějící ustanovení
          a generuje doporučení. Výstupy mají výhradně informativní charakter a <strong>nepředstavují právní poradenství</strong>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>3. Uživatelský účet a kredity</h2>
        <ul>
          <li>Registrace je bezplatná. Nový účet obdrží počáteční kredity pro testování služby.</li>
          <li>Každá analýza dokumentu odečte 1 kredit z vašeho zůstatku.</li>
          <li>Kredity lze zakoupit přes platební bránu Stripe. Platby jsou nevratné, pokud není dohodnuto jinak.</li>
          <li>Zakoupené kredity nemají dobu platnosti.</li>
          <li>Nevyužité kredity nejsou při zrušení účtu propláceny.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>4. Povolené použití</h2>
        <p>Zavazujete se, že nebudete:</p>
        <ul>
          <li>Nahrávat obsah porušující autorská práva nebo práva třetích stran.</li>
          <li>Zneužívat službu k automatizovanému hromadnému zpracování bez souhlasu provozovatele.</li>
          <li>Pokoušet se obejít bezpečnostní mechanismy nebo omezení služby.</li>
          <li>Sdílet přístupové údaje k účtu s třetími osobami.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>5. Omezení odpovědnosti</h2>
        <p>
          DocThink je poskytován „tak jak je" bez záruky přesnosti, úplnosti nebo vhodnosti pro konkrétní účel.
          Provozovatel nenese odpovědnost za jakékoli škody vzniklé v důsledku spoléhání se na výstupy AI analýzy.
          Uživatel nese plnou odpovědnost za svá rozhodnutí.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>6. Dostupnost služby</h2>
        <p>
          Provozovatel se snaží zajistit nepřetržitý provoz, ale nevylučuje výpadky z důvodu údržby nebo technických problémů.
          Provozovatel si vyhrazuje právo kdykoli pozastavit nebo ukončit poskytování služby.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>7. Změny podmínek</h2>
        <p>
          Provozovatel si vyhrazuje právo podmínky kdykoli změnit. O podstatných změnách budou registrovaní uživatelé
          informováni emailem. Další používání služby po změně podmínek znamená souhlas s novými podmínkami.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>8. Rozhodné právo</h2>
        <p>
          Tyto podmínky se řídí právním řádem České republiky. Případné spory budou řešeny před příslušnými
          soudy České republiky.
        </p>
      </section>

      <section>
        <h2 style={{ color: '#7F77DD' }}>9. Kontakt</h2>
        <p>
          Dotazy k podmínkám: <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <a href="/privacy" style={{ color: '#7F77DD', textDecoration: 'none', fontSize: 14 }}>Ochrana osobních údajů</a>
        <a href="/disclaimer" style={{ color: '#7F77DD', textDecoration: 'none', fontSize: 14 }}>Právní upozornění</a>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>← Zpět do aplikace</a>
      </div>
    </main>
  )
}
