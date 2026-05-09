'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PLANS = [
  { id: 'starter', credits: 10, price: 99, perCredit: '9,90', eur: '€4' },
  { id: 'pro',     credits: 40, price: 349, perCredit: '8,73', eur: '€14' },
  { id: 'team',    credits: 120, price: 999, perCredit: '8,33', eur: '€40' },
]

const CREDIT_COSTS = [
  { icon: '🛡️', label: 'Analýza smlouvy', credits: 1 },
  { icon: '⚠️', label: 'Detekce rizik', credits: 1 },
  { icon: '🔍', label: 'Hluboká kontrola dokumentu', credits: 2 },
  { icon: '📋', label: 'Kontrola pracovní smlouvy', credits: 2 },
  { icon: '🏠', label: 'Analýza nájemní smlouvy', credits: 2 },
  { icon: '💬', label: 'Chat s dokumentem', credits: null },
]

const VALUE_ITEMS = [
  { icon: '⚖️', label: 'Advokát', doc: 'Konzultace', alt: '1 500–5 000 Kč', you: '10–20 Kč' },
  { icon: '🛡️', label: 'Ochrana', doc: 'Nevýhodná klauzule', alt: 'stojí tisíce', you: 'zachytí za sekundy' },
  { icon: '📋', label: 'Rychlost', doc: 'Čtení smlouvy', alt: '30–60 min', you: '30 sekund' },
]

const PLAN_TAGS = [null, '⭐ Nejoblíbenější', '💼 Pro firmy']
const PLAN_NAMES = ['Starter', 'Pro', 'Business']
const PLAN_DESCS = [
  'Ideální pro příležitostnou kontrolu smluv — nájemní, pracovní nebo obchodní.',
  'Pro pravidelné uživatele — kontrolujte smlouvy bez omezení a bez starostí.',
  'Pro firmy a právníky — hromadné analýzy dokumentů za nejlepší cenu.',
]
const PLAN_FEATURES = [
  ['10 analýz smluv', 'Detekce rizik', 'Chat s dokumentem', 'Verdikt: podepsat / upravit / odmítnout'],
  ['40 analýz smluv', 'Prioritní zpracování', 'Chat s dokumentem', 'Kompletní rozbor každé smlouvy'],
  ['120 analýz smluv', 'Nejnižší cena za analýzu', 'Vhodné pro tým', 'Neomezený chat s dokumentem'],
]

function creditLabel(n: number | null) {
  if (n === null) return 'zdarma'
  if (n === 1) return '1 kredit'
  if (n >= 2 && n <= 4) return `${n} kredity`
  return `${n} kreditů`
}

export default function KoupitPage() {
  const [selected, setSelected] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
  }, [])

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
      setError(err.message || 'Platba selhala. Zkuste to prosím znovu.')
      setLoading(false)
    }
  }

  const plan = PLANS.find(p => p.id === selected)!
  const planIdx = PLANS.findIndex(p => p.id === selected)

  return (
    <div className={styles.wrap}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <nav className={styles.nav}>
        <button className={styles.back} onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Zpět
        </button>
        <div className={styles.logo}>🛡️ DocThink</div>
        <div style={{ width: 80 }} />
      </nav>

      <div className={styles.content}>

        {/* HEADER */}
        <div className={`${styles.header} ${styles.animate}`} data-anim>
          <div className={styles.headerBadge}>🛡️ Ochrana smluv s AI</div>
          <h1 className={styles.title}>Získejte kredity a chraňte se</h1>
          <p className={styles.sub}>Každý kredit = jedna analýza smlouvy s verdiktem, riziky a doporučením.</p>
        </div>

        {/* VALUE BAR */}
        <div className={`${styles.valueBar} ${styles.animate}`} data-anim>
          {VALUE_ITEMS.map((v, i) => (
            <div key={i} className={styles.valueItem}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <div className={styles.valueText}>
                <span className={styles.valueLabel}>{v.label}</span>
                <div className={styles.valuePrices}>
                  <span className={styles.valueAlt}>{v.doc}: {v.alt}</span>
                  <span className={styles.valueSep}>→</span>
                  <span className={styles.valueYou}>DocThink: {v.you}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PLANS */}
        <div className={`${styles.plans} ${styles.animate}`} data-anim>
          {PLANS.map((p, i) => (
            <button
              key={p.id}
              className={`${styles.plan} ${selected === p.id ? styles.planActive : ''} ${i === 1 ? styles.planFeatured : ''}`}
              onClick={() => setSelected(p.id)}
            >
              {PLAN_TAGS[i] && (
                <div className={`${styles.planTag} ${i === 2 ? styles.planTagGreen : ''}`}>
                  {PLAN_TAGS[i]}
                </div>
              )}
              <div className={styles.planName}>{PLAN_NAMES[i]}</div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>{p.price}</span>
                <span className={styles.planCurrency}>Kč</span>
              </div>
              <div className={styles.planCreditsRow}>
                <span className={styles.planCredits}>{creditLabel(p.credits)}</span>
                <span className={styles.planPerCredit}>{p.perCredit} Kč/k</span>
              </div>
              <p className={styles.planDesc}>{PLAN_DESCS[i]}</p>
              <ul className={styles.planFeatures}>
                {PLAN_FEATURES[i].map((f, j) => (
                  <li key={j} className={styles.planFeatureItem}>{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CHECKOUT SUMMARY */}
        <div className={`${styles.summary} ${styles.animate}`} data-anim>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryPlanName}>{PLAN_NAMES[planIdx]}</span>
            <span className={styles.summaryCredits}>{creditLabel(plan.credits)}</span>
          </div>
          <div className={styles.summaryBody}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Cena za kredit</span>
              <span className={styles.summaryVal}>{plan.perCredit} Kč</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Počet kreditů</span>
              <span className={styles.summaryVal}>{plan.credits}×</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryTotal}>Celkem</span>
              <span className={styles.summaryTotalVal}>{plan.price} Kč</span>
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
                Zaplatit {plan.price} Kč
              </>
            )}
          </button>
          <p className={styles.legal}>Jednorázová platba · Bez předplatného · Kredity nevypršejí</p>
        </div>

        {/* CREDIT COSTS TABLE */}
        <div className={`${styles.creditGuide} ${styles.animate}`} data-anim>
          <div className={styles.creditGuideTitle}>Co stojí jeden kredit?</div>
          <div className={styles.creditGuideGrid}>
            {CREDIT_COSTS.map((c, i) => (
              <div key={i} className={styles.creditGuideRow}>
                <span className={styles.creditGuideIcon}>{c.icon}</span>
                <span className={styles.creditGuideLabel}>{c.label}</span>
                <span className={styles.creditGuideCost}>{creditLabel(c.credits)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={`${styles.faq} ${styles.animate}`} data-anim>
          {[
            { q: 'Jak dlouho kredity platí?', a: 'Kredity nevypršejí — zůstávají na vašem účtu, dokud je nespotřebujete.' },
            { q: 'Co přesně dostanu za jeden kredit?', a: 'Kompletní analýzu smlouvy: verdikt (podepsat / upravit / odmítnout), seznam rizik, chybějící klauzule a doporučení. Plus chat s dokumentem zdarma.' },
            { q: 'Je platba bezpečná?', a: 'Platby zpracovává Stripe — světový standard pro online platby. Vaše karta ani údaje nejsou ukládány na našich serverech.' },
            { q: 'Mohu dostat fakturu?', a: 'Ano, po platbě Stripe automaticky pošle potvrzení na váš email. Pro fakturu s IČ nás kontaktujte.' },
          ].map((item, i) => (
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
