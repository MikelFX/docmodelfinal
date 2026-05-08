'use client'

import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useEffect } from 'react'
import styles from './landing.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

const STAT_VALUES = ['14+', '24', '10×', '99%'] as const

const SAVINGS_PRICES = [
  { you: '€1', saving: '98%' },
  { you: '€2', saving: '97%' },
  { you: '€2', saving: '94%' },
  { you: '€2', saving: '99%' },
]

const PLANS = [
  { name: 'Starter', credits: 10, price: '€4', per: '€0.40 / credit' },
  { name: 'Pro', credits: 40, price: '€14', per: '€0.35 / credit', highlight: true },
  { name: 'Business', credits: 120, price: '€40', per: '€0.33 / credit' },
]

export default function LandingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const l = t.landing

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
        <div className={styles.badge}>✨ {l.badge}</div>
        <h1 className={styles.title}>
          {l.title1}<br />
          <span className={styles.titleAccent}>{l.title2}</span>
        </h1>
        <p className={styles.sub}>{l.sub}</p>
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
                <span className={styles.heroTagRisk}>{l.heroCard.riskLabel}</span>
                <span className={styles.heroCardText}>{l.heroCard.riskText}</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroTagAction}>{l.heroCard.actionLabel}</span>
                <span className={styles.heroCardText}>{l.heroCard.actionText}</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroTagFinance}>{l.heroCard.financeLabel}</span>
                <span className={styles.heroCardText}>{l.heroCard.financeText}</span>
              </div>
            </div>
            <div className={styles.heroCardFooter}>
              <div className={styles.heroCardAiBadge}>⚡ {l.heroCard.aiComplete}</div>
            </div>
          </div>
          <div className={styles.heroCardGlow} />
        </div>
      </div>

      {/* TRUST BADGES */}
      <div className={`${styles.trustStrip} ${styles.animate}`} data-anim>
        {l.trust.map(b => (
          <div key={b.label} className={styles.trustBadge}>
            <span className={styles.trustIcon}>{b.icon}</span>
            <span className={styles.trustLabel}>{b.label}</span>
            <span className={styles.trustSub}>{b.sub}</span>
          </div>
        ))}
      </div>

      {/* STATS STRIP */}
      <div className={`${styles.stats} ${styles.animate}`} data-anim>
        {STAT_VALUES.map((value, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{l.statsLabels[i]}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div className={styles.featuresWrap}>
        <div className={`${styles.sectionLabel} ${styles.animate}`} data-anim>{l.featuresLabel}</div>
        <div className={styles.features}>
          {l.features.map((f, i) => (
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
        <div className={styles.sectionLabel}>{l.savingsLabel}</div>
        <div className={styles.savingsGrid}>
          {l.savings.map((s, i) => (
            <div
              key={s.label}
              className={styles.savingsItem}
              style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              <div className={styles.savingsLabel}>{s.label}</div>
              <div className={styles.savingsAlt}>{s.alt}</div>
              <div className={styles.savingsArrow}>↓</div>
              <div className={styles.savingsYou}>{SAVINGS_PRICES[i].you}</div>
              <div className={styles.savingsPct}>−{SAVINGS_PRICES[i].saving}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className={`${styles.pricing} ${styles.animate}`} data-anim>
        <div className={styles.sectionLabel}>{l.pricingLabel}</div>
        <h2 className={styles.pricingTitle}>{l.pricingTitle}</h2>
        <p className={styles.pricingSub}>{l.pricingSub}</p>
        <div className={styles.plans}>
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`${styles.plan} ${p.highlight ? styles.planHighlight : ''}`}
              style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
            >
              {p.highlight && <div className={styles.planBadge}>{l.mostPopular}</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}</div>
              <div className={styles.planCredits}>{p.credits} credits</div>
              <div className={styles.planPer}>{p.per}</div>
            </div>
          ))}
        </div>
        <button className={styles.heroCta} onClick={() => router.push('/koupit')}>
          {l.viewPlans}
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div className={styles.footerLinks}>
          <span>{l.footer}</span>
        </div>
      </footer>
    </div>
  )
}
