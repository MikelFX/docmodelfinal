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
            <button className={styles.signInBtn} onClick={() => router.push('/sign-in')}>Sign in</button>
            <button className={styles.ctaBtn} onClick={() => router.push('/sign-up')}>Get started free →</button>
          </SignedOut>
          <SignedIn>
            <button className={styles.ctaBtn} onClick={() => router.push('/app')}>Open DocThink →</button>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.badge}>✨ AI tool for documents & code</div>
        <h1 className={styles.title}>
          Analyze documents<br />
          <span className={styles.titleAccent}>10× faster</span>
        </h1>
        <p className={styles.sub}>
          Upload a PDF, Word, or TXT file and AI will instantly generate summaries,
          action items, risks, or a brand-new document. Or generate a fully working website.
        </p>
        <div className={styles.heroActions}>
          <SignedOut>
            <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
              Try free — 10 credits
            </button>
            <button className={styles.heroSecondary} onClick={() => router.push('/sign-in')}>
              Sign in
            </button>
          </SignedOut>
          <SignedIn>
            <button className={styles.heroCta} onClick={() => router.push('/app')}>
              Open app →
            </button>
          </SignedIn>
        </div>
      </div>

      {/* FEATURES */}
      <div className={styles.features}>
        {[
          { icon: '📋', title: 'Summary', desc: 'A concise overview of any document in seconds.' },
          { icon: '⚠️', title: 'Risks', desc: 'Identifies issues, red flags, and risky clauses.' },
          { icon: '🌍', title: 'Translator', desc: 'Translates documents into 22 languages accurately.' },
          { icon: '📝', title: 'Template generator', desc: 'Generates contracts, NDAs, proposals, and more.' },
          { icon: '💻', title: 'Code generator', desc: 'Describe a website or script — AI generates working code.' },
          { icon: '🤖', title: 'AI Interviewer', desc: 'Creates a complete professional document through dialogue.' },
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
        <div className={styles.savingsTitle}>How much do you save?</div>
        <div className={styles.savingsGrid}>
          {[
            { label: 'Contract review', alt: 'Lawyer €50', you: '€1', saving: '98%' },
            { label: 'Document translation', alt: 'Translator €35', you: '€2', saving: '94%' },
            { label: 'Contract template', alt: 'Legal template €200', you: '€2', saving: '99%' },
            { label: 'Code generator', alt: 'Developer €150', you: '€3', saving: '98%' },
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
        <h2 className={styles.pricingTitle}>Pay only for what you use</h2>
        <p className={styles.pricingSub}>Credits never expire · No subscription · Cancel anytime</p>
        <div className={styles.plans}>
          {[
            { name: 'Starter', credits: 10, price: '€4', per: '€0.40 / credit' },
            { name: 'Pro', credits: 40, price: '€14', per: '€0.35 / credit', highlight: true },
            { name: 'Business', credits: 120, price: '€40', per: '€0.33 / credit' },
          ].map(p => (
            <div key={p.name} className={`${styles.plan} ${p.highlight ? styles.planHighlight : ''}`}>
              {p.highlight && <div className={styles.planBadge}>Most popular</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}</div>
              <div className={styles.planCredits}>{p.credits} credits</div>
              <div className={styles.planPer}>{p.per}</div>
            </div>
          ))}
        </div>
        <button className={styles.heroCta} onClick={() => router.push('/koupit')}>
          View all plans →
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div className={styles.footerLinks}>
          <span>© 2025 DocThink · For freelancers in EU</span>
        </div>
      </footer>
    </div>
  )
}
