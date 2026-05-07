'use client'

import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import styles from './landing.module.css'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoDot} />
          docthink
        </div>
        <div className={styles.navRight}>
          <SignedOut>
            <button className={styles.signInBtn} onClick={() => router.push('/sign-in')}>Přihlásit se</button>
            <button className={styles.ctaBtn} onClick={() => router.push('/sign-up')}>Začít zdarma →</button>
          </SignedOut>
          <SignedIn>
            <button className={styles.ctaBtn} onClick={() => router.push('/app')}>Otevřít DocThink →</button>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.badge}>✨ AI nástroj pro dokumenty a kód</div>
        <h1 className={styles.title}>
          Analyzuj dokumenty<br />
          <span className={styles.titleAccent}>10× rychleji</span>
        </h1>
        <p className={styles.sub}>
          Nahraj PDF, Word nebo TXT a AI ti během sekund vytvoří shrnutí,
          akční body, rizika nebo celý nový dokument. Nebo vygeneruje funkční web.
        </p>
        <div className={styles.heroActions}>
          <SignedOut>
            <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
              Vyzkoušet zdarma — 10 kreditů
            </button>
            <button className={styles.heroSecondary} onClick={() => router.push('/sign-in')}>
              Přihlásit se
            </button>
          </SignedOut>
          <SignedIn>
            <button className={styles.heroCta} onClick={() => router.push('/app')}>
              Otevřít aplikaci →
            </button>
          </SignedIn>
        </div>
      </div>

      {/* FEATURES */}
      <div className={styles.features}>
        {[
          { icon: '📋', title: 'Shrnutí', desc: 'Stručný přehled celého dokumentu během sekund.' },
          { icon: '⚠️', title: 'Rizika', desc: 'Identifikuje problémy, červené vlajky a rizikové klauzule.' },
          { icon: '🌍', title: 'Překladač', desc: 'Přeloží dokument do 7 jazyků přesně a rychle.' },
          { icon: '📝', title: 'Generátor šablon', desc: 'Vygeneruje smlouvu, NDA, nabídku nebo jiný dokument.' },
          { icon: '💻', title: 'Generátor kódu', desc: 'Popíšeš web nebo skript — AI vygeneruje funkční kód.' },
          { icon: '🤖', title: 'AI Tazatel', desc: 'Dialogem vytvoří kompletní profesionální dokument.' },
        ].map(f => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* SAVINGS STRIP */}
      <div className={styles.savings}>
        <div className={styles.savingsTitle}>Kolik ušetříš?</div>
        <div className={styles.savingsGrid}>
          {[
            { label: 'Analýza smlouvy', alt: 'Advokát 500 Kč', you: '10 Kč', saving: '98%' },
            { label: 'Překlad dokumentu', alt: 'Překladatel 350 Kč', you: '20 Kč', saving: '94%' },
            { label: 'Šablona smlouvy', alt: 'Právník 2 000 Kč', you: '20 Kč', saving: '99%' },
            { label: 'Generátor kódu', alt: 'Developer 1 500 Kč', you: '30 Kč', saving: '98%' },
          ].map(s => (
            <div key={s.label} className={styles.savingsItem}>
              <div className={styles.savingsLabel}>{s.label}</div>
              <div className={styles.savingsAlt}>{s.alt}</div>
              <div className={styles.savingsArrow}>↓</div>
              <div className={styles.savingsYou}>{s.you}</div>
              <div className={styles.savingsPct}>−{s.saving}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className={styles.pricing}>
        <h2 className={styles.pricingTitle}>Zaplať jen za co použiješ</h2>
        <p className={styles.pricingSub}>1 kredit = 10 Kč · Nevyprší · Bez předplatného</p>
        <div className={styles.plans}>
          {[
            { name: 'Starter', credits: 10, price: '99 Kč', per: '9,90 Kč/kredit' },
            { name: 'Pro', credits: 40, price: '349 Kč', per: '8,73 Kč/kredit', highlight: true },
            { name: 'Business', credits: 120, price: '999 Kč', per: '8,33 Kč/kredit' },
          ].map(p => (
            <div key={p.name} className={`${styles.plan} ${p.highlight ? styles.planHighlight : ''}`}>
              {p.highlight && <div className={styles.planBadge}>Nejoblíbenější</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}</div>
              <div className={styles.planCredits}>{p.credits} kreditů</div>
              <div className={styles.planPer}>{p.per}</div>
            </div>
          ))}
        </div>
        <button className={styles.heroCta} onClick={() => router.push('/koupit')}>
          Zobrazit všechny plány →
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div className={styles.footerLinks}>
          <span>© 2025 DocThink · Pro OSVČ v EU</span>
        </div>
      </footer>
    </div>
  )
}
