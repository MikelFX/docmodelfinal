'use client'

import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useEffect } from 'react'
import styles from './landing.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LandingPage() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const els = document.querySelectorAll('[data-anim]')
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
            <button className={styles.signInBtn} onClick={() => router.push('/sign-in')}>{t.hero.signIn}</button>
            <button className={styles.ctaBtn} onClick={() => router.push('/sign-up')}>{t.hero.tryFree}</button>
          </SignedOut>
          <SignedIn>
            <button className={styles.ctaBtn} onClick={() => router.push('/app')}>{t.hero.openApp}</button>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.badge}>✨ AI tool for documents & contracts</div>
        <h1 className={styles.title}>
          Analyze documents<br />
          <span className={styles.titleAccent}>10× faster</span>
        </h1>
        <p className={styles.sub}>
          Upload a PDF, Word, or TXT file and AI will instantly generate summaries,
          action items, risks, legal clause reviews, or a brand-new document — in any EU language.
        </p>
        <div className={styles.heroActions}>
          <SignedOut>
            <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
              {t.hero.tryFree}
            </button>
            <button className={styles.heroSecondary} onClick={() => router.push('/sign-in')}>
              {t.hero.signIn}
            </button>
          </SignedOut>
          <SignedIn>
            <button className={styles.heroCta} onClick={() => router.push('/app')}>
              {t.hero.openApp}
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

      {/* TRUST BADGES */}
      <div className={`${styles.trustStrip} ${styles.animate}`} data-anim>
        {[
          { icon: '🔒', label: 'Secure login', sub: 'Clerk Auth' },
          { icon: '⚡', label: 'Powered by', sub: 'Claude AI' },
          { icon: '🇪🇺', label: 'GDPR', sub: 'Compliant' },
          { icon: '💳', label: 'Payments', sub: 'via Stripe' },
          { icon: '🚫', label: 'No subscription', sub: 'Pay per use' },
          { icon: '♾️', label: 'Credits', sub: 'never expire' },
        ].map(b => (
          <div key={b.label} className={styles.trustBadge}>
            <span className={styles.trustIcon}>{b.icon}</span>
            <span className={styles.trustLabel}>{b.label}</span>
            <span className={styles.trustSub}>{b.sub}</span>
          </div>
        ))}
      </div>

      {/* STATS STRIP */}
      <div className={`${styles.stats} ${styles.animate}`} data-anim>
        {[
          { value: '14+', label: 'AI tools' },
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
        <div className={`${styles.sectionLabel} ${styles.animate}`} data-anim>What DocThink can do</div>
        <div className={styles.features}>
          {[
            { icon: '📋', title: 'Summary', desc: 'A concise structured overview of any document in seconds.' },
            { icon: '⚠️', title: 'Risks', desc: 'Identifies critical issues, red flags, and risky clauses before you sign.' },
            { icon: '⚖️', title: 'Legal clauses', desc: 'Extracts every clause and rates it FAIR / REVIEW / UNFAVORABLE / MISSING.' },
            { icon: '🔍', title: 'Compare docs', desc: 'Upload two versions — AI highlights every change and its impact.' },
            { icon: '💰', title: 'Finance analyst', desc: 'Deep financial analysis: payments, hidden costs, cash flow implications.' },
            { icon: '✅', title: 'Action items', desc: 'Extracts all tasks, owners, and deadlines grouped by priority.' },
            { icon: '🌍', title: 'Translator', desc: 'Translates documents into 24 EU languages with full accuracy.' },
            { icon: '📝', title: 'Template generator', desc: 'Generates contracts, NDAs, proposals, and more from a description.' },
            { icon: '🤖', title: 'AI Interviewer', desc: 'Creates a complete professional document through Q&A dialogue.' },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`${styles.featureCard} ${styles.animate}`}
              data-anim
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
      <div className={`${styles.savings} ${styles.animate}`} data-anim>
        <div className={styles.sectionLabel}>How much do you save?</div>
        <div className={styles.savingsGrid}>
          {[
            { label: 'Contract review', alt: 'Lawyer €50', you: '€1', saving: '98%' },
            { label: 'Legal clause analysis', alt: 'Legal consultant €80', you: '€2', saving: '97%' },
            { label: 'Document translation', alt: 'Translator €35', you: '€2', saving: '94%' },
            { label: 'Contract template', alt: 'Legal template €200', you: '€2', saving: '99%' },
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
      <div className={`${styles.pricing} ${styles.animate}`} data-anim>
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
