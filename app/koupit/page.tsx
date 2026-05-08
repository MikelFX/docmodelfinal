'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

const PLAN_IDS = ['starter', 'pro', 'team'] as const

const PLANS = [
  { id: 'starter', credits: 10, price: 99, perCredit: '9,90', eur: '€4' },
  { id: 'pro',     credits: 40, price: 349, perCredit: '8,73', eur: '€14' },
  { id: 'team',    credits: 120, price: 999, perCredit: '8,33', eur: '€40' },
]

const CREDIT_COSTS = [
  { icon: '📋', credits: 1 },
  { icon: '📅', credits: 1 },
  { icon: '🌍', credits: 2 },
  { icon: '✍️', credits: 2 },
  { icon: '📝', credits: 2 },
  { icon: '📧', credits: 2 },
  { icon: '⚖️', credits: 2 },
  { icon: '🔍', credits: 2 },
  { icon: '🤖', credits: 5 },
  { icon: '✨', credits: null },
]

const VALUE_ICONS = ['⚖️', '🌍', '📝']

export default function KoupitPage() {
  const [selected, setSelected] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t, lang } = useLanguage()
  const k = t.koupit
  const currency = (lang === 'cs' || lang === 'sk') ? 'Kč' : 'CZK'

  useEffect(() => {
    const els = document.querySelectorAll('[data-anim]')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.visible)
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => {
      el.classList.remove(styles.visible)
      obs.observe(el)
    })
    return () => obs.disconnect()
  }, [lang])

  async function handleBuy() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const plan = PLANS.find(p => p.id === selected)!

  return (
    <div className={styles.wrap}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <nav className={styles.nav}>
        <button className={styles.back} onClick={() => router.push('/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {k.back}
        </button>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div style={{ width: 80 }} />
      </nav>

      <div className={styles.content}>

        {/* HEADER */}
        <div className={`${styles.header} ${styles.animate}`} data-anim>
          <div className={styles.headerBadge}>{k.badge}</div>
          <h1 className={styles.title}>{k.title}</h1>
          <p className={styles.sub}>{k.sub}</p>
        </div>

        {/* VALUE BAR */}
        <div className={`${styles.valueBar} ${styles.animate}`} data-anim>
          {k.valueItems.map((v, i) => (
            <div key={i} className={styles.valueItem}>
              <span className={styles.valueIcon}>{VALUE_ICONS[i]}</span>
              <div className={styles.valueText}>
                <span className={styles.valueLabel}>{v.label}</span>
                <div className={styles.valuePrices}>
                  <span className={styles.valueAlt}>{v.doc} {v.alt}</span>
                  <span className={styles.valueSep}>→</span>
                  <span className={styles.valueYou}>DocThink {v.you}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PLANS */}
        <div className={`${styles.plans} ${styles.animate}`} data-anim>
          {PLANS.map((p, i) => {
            const tag = i === 1 ? k.planTag1 : i === 2 ? k.planTag2 : null
            return (
              <button
                key={p.id}
                className={`${styles.plan} ${selected === p.id ? styles.planActive : ''} ${i === 1 ? styles.planFeatured : ''}`}
                onClick={() => setSelected(p.id)}
              >
                {tag && (
                  <div className={`${styles.planTag} ${i === 2 ? styles.planTagGreen : ''}`}>
                    {tag}
                  </div>
                )}
                <div className={styles.planName}>{p.id === 'team' ? 'Business' : p.id.charAt(0).toUpperCase() + p.id.slice(1)}</div>
                <div className={styles.planPriceRow}>
                  <span className={styles.planAmount}>{p.price}</span>
                  <span className={styles.planCurrency}>{currency}</span>
                  {currency !== 'Kč' && <span className={styles.planEur}>≈ {p.eur}</span>}
                </div>
                <div className={styles.planCreditsRow}>
                  <span className={styles.planCredits}>{p.credits} {t.credit(p.credits)}</span>
                  <span className={styles.planPerCredit}>{p.perCredit} {currency}/k</span>
                </div>
                <p className={styles.planDesc}>{k.planDescs[i]}</p>
                <ul className={styles.planFeatures}>
                  {k.planFeatures[i].map((f, j) => (
                    <li key={j} className={styles.planFeatureItem}>{f}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* CHECKOUT SUMMARY */}
        <div className={`${styles.summary} ${styles.animate}`} data-anim>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryPlanName}>{plan.id === 'team' ? 'Business' : plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</span>
            <span className={styles.summaryCredits}>{plan.credits} {t.credit(plan.credits)}</span>
          </div>
          <div className={styles.summaryBody}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{k.priceLabel}</span>
              <span className={styles.summaryVal}>{plan.perCredit} {currency}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{k.countLabel}</span>
              <span className={styles.summaryVal}>{plan.credits}×</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryTotal}>{k.totalLabel}</span>
              <span className={styles.summaryTotalVal}>{plan.price} {currency}</span>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button className={styles.buyBtn} onClick={handleBuy} disabled={loading}>
            {loading ? (
              <span className={styles.dots}><span /><span /><span /></span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {k.payBtnPrefix} {plan.price} {k.payBtnSuffix}
              </>
            )}
          </button>
          <p className={styles.legal}>{k.legal}</p>
        </div>

        {/* CREDIT COSTS TABLE */}
        <div className={`${styles.creditGuide} ${styles.animate}`} data-anim>
          <div className={styles.creditGuideTitle}>{k.guideTitle}</div>
          <div className={styles.creditGuideGrid}>
            {CREDIT_COSTS.map((c, i) => (
              <div key={i} className={styles.creditGuideRow}>
                <span className={styles.creditGuideIcon}>{c.icon}</span>
                <span className={styles.creditGuideLabel}>{k.guideLabels[i]}</span>
                <span className={styles.creditGuideCost}>
                  {c.credits !== null
                    ? `${c.credits} ${t.credit(c.credits)}`
                    : k.guideChatCredits}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={`${styles.faq} ${styles.animate}`} data-anim>
          {k.faq.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <div className={styles.faqQ}>{item.q}</div>
              <div className={styles.faqA}>{item.a}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
