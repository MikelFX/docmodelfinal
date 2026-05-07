'use client'

import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useEffect } from 'react'
import styles from './landing.module.css'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.visible)
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />
      <div className={styles.ambientOrb3} />

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

        {/* Hero floating UI mockup */}
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardDots}>
                <span /><span /><span />
              </div>
              <span className={styles.heroCardTitle}>contract_q3.pdf</span>
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroCardRow}>
                <span className={styles.heroTagRisk}>risk</span>
                <span className={styles.heroCardText}>Termination clause lacks 30-day notice period</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroTagAction}>action</span>
                <span className={styles.heroCardText}>Review payment schedule by Oct 15</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroTagFinance}>finance</span>
                <span className={styles.heroCardText}>Penalty clause: 2% monthly on late payments</span>
              </div>
            </div>
            <div className={styles.heroCardFooter}>
              <div className={styles.heroCardAiBadge}>⚡ AI analysis complete</div>
            </div>
          </div>
          <div className={styles.heroCardGlow} />
        </div>
      </div>

      {/* STATS STRIP */}
      <div className={styles.stats} data-animate>
        {[
          { value: '13+', label: 'AI tools' },
          { value: '24', label: 'EU languages' },
          { value: '10×', label: 'faster than manual' },
          { value: '99%', label: 'cost reduction' },
        ].map(s => (
          <div key={s.label} className={styles.statItem}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div className={styles.featuresWrap}>
        <div className={styles.sectionLabel} data-animate>What DocThink can do</div>
        <div className={styles.features}>
          {[
            { icon: '📋', title: 'Summary', desc: 'A concise overview of any document in seconds.' },
            { icon: '⚠️', title: 'Risks', desc: 'Identifies issues, red flags, and risky clauses.' },
            { icon: '🌍', title: 'Translator', desc: 'Translates documents into 24 EU languages accurately.' },
            { icon: '📝', title: 'Template generator', desc: 'Generates contracts, NDAs, proposals, and more.' },
            { icon: '💻', title: 'Code generator', desc: 'Describe a website or script — AI generates working code.' },
            { icon: '🤖', title: 'AI Interviewer', desc: 'Creates a complete professional document through dialogue.' },
            { icon: '💰', title: 'Finance analyst', desc: 'Deep financial analysis: payments, risks, hidden costs.' },
            { icon: '📦', title: 'Batch analysis', desc: 'Analyze up to 25 documents at once and get summaries for all.' },
            { icon: '💬', title: 'AI Chat', desc: 'Ask any question about your document and get instant answers.' },
          ].map((f, i) => (
            <div
              key={f.title}
              className={styles.featureCard}
              data-animate
              style={{ '--delay': `${i * 0.06}s` } as React.CSSProperties}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVINGS STRIP */}
      <div className={styles.savings} data-animate>
        <div className={styles.sectionLabel}>How much do you save?</div>
        <div className={styles.savingsGrid}>
          {[
            { label: 'Contract review', alt: 'Lawyer €50', you: '€1', saving: '98%' },
            { label: 'Document translation', alt: 'Translator €35', you: '€2', saving: '94%' },
            { label: 'Contract template', alt: 'Legal template €200', you: '€2', saving: '99%' },
            { label: 'Code generator', alt: 'Developer €150', you: '€3', saving: '98%' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={styles.savingsItem}
              style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
            >
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
      <div className={styles.pricing} data-animate>
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.pricingTitle}>Pay only for what you use</h2>
        <p className={styles.pricingSub}>Credits never expire · No subscription · Cancel anytime</p>
        <div className={styles.plans}>
          {[
            { name: 'Starter', credits: 10, price: '€4', per: '€0.40 / credit' },
            { name: 'Pro', credits: 40, price: '€14', per: '€0.35 / credit', highlight: true },
            { name: 'Business', credits: 120, price: '€40', per: '€0.33 / credit' },
          ].map((p, i) => (
            <div
              key={p.name}
              className={`${styles.plan} ${p.highlight ? styles.planHighlight : ''}`}
              style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
            >
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
