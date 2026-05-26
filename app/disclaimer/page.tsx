import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Právní upozornění — DocThink',
  description: 'DocThink poskytuje informativní analýzu smluv pomocí AI. Nejedná se o právní poradenství.',
}

export default function DisclaimerPage() {
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
      <h1 style={{ color: '#fff', marginBottom: 8 }}>Právní upozornění</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>Poslední aktualizace: 26. 5. 2025</p>

      <div style={{
        background: '#1a0a0a',
        border: '1px solid #7f2020',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 40,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, color: '#f87171', fontWeight: 600 }}>
          DocThink není právní poradce. Výstupy aplikace mají pouze informativní charakter a nenahrazují odbornou právní pomoc.
        </p>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>1. Co DocThink dělá</h2>
        <p>
          DocThink je nástroj využívající umělou inteligenci (AI) k automatické analýze smluvních dokumentů.
          Aplikace identifikuje potenciálně rizikové formulace, chybějící ujednání a doporučuje verdikt
          (podepsat / upravit / odmítnout) na základě obsahu nahraného dokumentu.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>2. Co DocThink NENÍ</h2>
        <ul>
          <li>DocThink <strong>není advokát, právník ani právní poradce</strong>.</li>
          <li>Analýza generovaná AI <strong>nepředstavuje právní radu ani právní posudek</strong>.</li>
          <li>Výsledky analýzy <strong>nemohou nahradit konzultaci s kvalifikovaným právníkem</strong>.</li>
          <li>DocThink <strong>nezaručuje úplnost, přesnost ani aktuálnost</strong> poskytnutých výstupů.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>3. Omezení odpovědnosti</h2>
        <p>
          Provozovatel DocThink nenese žádnou odpovědnost za škody, ztráty ani jiné újmy, které vzniknou
          v důsledku rozhodnutí učiněných na základě výstupů aplikace. Uživatel používá aplikaci výhradně
          na vlastní riziko.
        </p>
        <p>
          AI modely mohou generovat nepřesné, neúplné nebo zavádějící informace. Každá smlouva má svá
          specifika a závazná interpretace vyžaduje posouzení odborníkem se znalostí platného práva
          a konkrétního kontextu.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>4. Doporučení</h2>
        <p>
          Před podpisem jakékoliv smlouvy, zejména té s vyšší hodnotou nebo závazností, vždy doporučujeme:
        </p>
        <ul>
          <li>Konzultovat smlouvu s advokátem nebo jiným právním odborníkem.</li>
          <li>Ověřit si aktuální právní předpisy platné ve vaší zemi.</li>
          <li>Využít analýzu DocThink jako <strong>první orientační krok</strong>, nikoliv jako finální stanovisko.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>5. Rozhodné právo</h2>
        <p>
          Toto upozornění se řídí právním řádem České republiky. Veškeré spory budou řešeny před
          příslušnými soudy České republiky.
        </p>
      </section>

      <section>
        <h2 style={{ color: '#7F77DD' }}>6. Kontakt</h2>
        <p>
          Dotazy: <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222', display: 'flex', gap: 24 }}>
        <a href="/privacy" style={{ color: '#7F77DD', textDecoration: 'none', fontSize: 14 }}>Ochrana osobních údajů</a>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>← Zpět do aplikace</a>
      </div>
    </main>
  )
}
