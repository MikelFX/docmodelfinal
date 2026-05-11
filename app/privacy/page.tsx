import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů — DocThink',
  description: 'Zásady ochrany osobních údajů aplikace DocThink',
}

export default function PrivacyPage() {
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
      <h1 style={{ color: '#fff', marginBottom: 8 }}>Ochrana osobních údajů</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>Poslední aktualizace: 11. 5. 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>1. Provozovatel</h2>
        <p>DocThink je provozován jako individuální projekt. Kontakt: <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>2. Jaké údaje zpracováváme</h2>
        <ul>
          <li><strong>Přihlašovací údaje</strong> — e-mail a heslo pro vytvoření účtu (spravuje Clerk, Inc.)</li>
          <li><strong>Dokumenty a fotografie</strong> — soubory které nahraješ za účelem analýzy. Nejsou trvale ukládány — jsou odeslány AI modelu a po analýze zahozeny.</li>
          <li><strong>Platební údaje</strong> — zpracovává výhradně Stripe, Inc. My nemáme přístup k číslu karty.</li>
          <li><strong>Počet kreditů</strong> — ukládáme pouze počet zbývajících analýz na tvém účtu.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>3. Účel zpracování</h2>
        <ul>
          <li>Poskytnutí služby analýzy smluv a dokumentů pomocí AI</li>
          <li>Správa uživatelského účtu a kreditů</li>
          <li>Zpracování plateb za prémiové kredity</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>4. Třetí strany</h2>
        <ul>
          <li><strong>Clerk</strong> — autentizace (<a href="https://clerk.com/privacy" style={{ color: '#7F77DD' }}>clerk.com/privacy</a>)</li>
          <li><strong>Anthropic</strong> — AI analýza dokumentů (<a href="https://anthropic.com/privacy" style={{ color: '#7F77DD' }}>anthropic.com/privacy</a>)</li>
          <li><strong>Stripe</strong> — platby (<a href="https://stripe.com/privacy" style={{ color: '#7F77DD' }}>stripe.com/privacy</a>)</li>
          <li><strong>Upstash</strong> — ukládání počtu kreditů (<a href="https://upstash.com/privacy" style={{ color: '#7F77DD' }}>upstash.com/privacy</a>)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>5. Cookies</h2>
        <p>Používáme pouze technické cookies nezbytné pro přihlášení a provoz aplikace. Nepoužíváme reklamní ani sledovací cookies.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>6. Tvá práva</h2>
        <p>Máš právo na přístup ke svým údajům, jejich opravu nebo smazání. Žádost pošli na <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a>. Účet lze smazat přímo v aplikaci.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#7F77DD' }}>7. Bezpečnost</h2>
        <p>Veškerá komunikace je šifrována přes HTTPS. Dokumenty nejsou dlouhodobě ukládány na serverech.</p>
      </section>

      <section>
        <h2 style={{ color: '#7F77DD' }}>8. Kontakt</h2>
        <p>Otázky k ochraně dat: <a href="mailto:info@docthink.app" style={{ color: '#7F77DD' }}>info@docthink.app</a></p>
      </section>
    </main>
  )
}
