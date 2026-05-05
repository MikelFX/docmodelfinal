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
          docmind
        </div>
        <div className={styles.navRight}>
          <SignedOut>
            <button className={styles.signInBtn} onClick={() => router.push('/sign-in')}>Přihlásit se</button>
            <button className={styles.ctaBtn} onClick={() => router.push('/sign-up')}>Začít zdarma →</button>
          </SignedOut>
          <SignedIn>
            <button className={styles.ctaBtn} onClick={() => router.push('/app')}>Otevřít DocMind →</button>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.badge}>✨ AI nástroj pro dokumenty</div>
        <h1 className={styles.title}>
          Analyzuj dokumenty<br />
          <span className={styles.titleAccent}>10× rychleji</span>
        </h1>
        <p className={styles.sub}>
          Nahraj PDF, Word nebo TXT a AI ti během sekund vytvoří shrnutí,
          akční body, rizika nebo celý nový dokument.
        </p>
        <div className={styles.heroActions}>
          <SignedOut>
            <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
              Vyzkoušet zdarma — 5 kreditů
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

      <div className={styles.features}>
        {[
          { icon: '📋', title: 'Shrnutí', desc: 'Stručný přehled celého dokumentu během sekund.' },
          { icon: '✅', title: 'Akční body', desc: 'Automaticky najde co je potřeba udělat.' },
          { icon: '⚠️', title: 'Rizika', desc: 'Identifikuje problémy a červené vlajky.' },
          { icon: '🌍', title: 'Překladač', desc: 'Přeloží dokument do 6 jazyků.' },
          { icon: '✍️', title: 'Přepisovač', desc: 'Přepíše text do formálnějšího jazyka.' },
          { icon: '📝', title: 'Generátor šablon', desc: 'Vygeneruje smlouvu, NDA, nabídku...' },
        ].map(f => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.pricing}>
        <h2 className={styles.pricingTitle}>Jednoduché ceny</h2>
        <div className={styles.plans}>
          {[
            { name: 'Starter', credits: 10, price: '$4.99', per: '$0.50 / dok.' },
            { name: 'Pro', credits: 50, price: '$14.99', per: '$0.30 / dok.', highlight: true },
            { name: 'Team', credits: 200, price: '$49.99', per: '$0.25 / dok.' },
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
        <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
          Začít zdarma →
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.logo}><div className={styles.logoDot} />docmind</div>
        <div className={styles.footerLinks}>
          <span>© 2025 DocMind</span>
        </div>
      </footer>
    </div>
  )
}
