'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: 99,
    perCredit: '9,90',
    tag: null,
    desc: 'Vyzkoušej bez závazků',
    features: [
      'Analýza, shrnutí, rizika, klauzule',
      'Překlad do 24 EU jazyků',
      'Generátor emailů a šablon',
      'Porovnání dokumentů (compare)',
      'AI Chat (1 kredit / 5 zpráv)',
      'Export TXT a PDF',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 40,
    price: 349,
    perCredit: '8,73',
    tag: 'Nejoblíbenější',
    desc: 'Ideální pro OSVČ',
    features: [
      'Vše ze Starter balíčku',
      'AI Tazatel — tvorba dokumentů dialogem',
      'Hromadná analýza až 25 dokumentů',
      '4× více kreditů za lepší cenu',
    ],
  },
  {
    id: 'team',
    name: 'Business',
    credits: 120,
    price: 999,
    perCredit: '8,33',
    tag: 'Nejlepší hodnota',
    desc: 'Pro agentury a firmy',
    features: [
      'Vše z Pro balíčku',
      '120 kreditů — největší zásobník',
      'Nejnižší cena za kredit',
      'Prioritní zpracování',
    ],
  },
]

const CREDIT_COSTS = [
  { icon: '📋', label: 'Analýza / shrnutí / rizika', credits: 1 },
  { icon: '📅', label: 'Extrakce termínů a deadlinů', credits: 1 },
  { icon: '🌍', label: 'Překlad dokumentu', credits: 2 },
  { icon: '✍️', label: 'Přepisovač stylu', credits: 2 },
  { icon: '📝', label: 'Generátor šablon a smluv', credits: 2 },
  { icon: '📧', label: 'Generátor emailů', credits: 2 },
  { icon: '⚖️', label: 'Analýza klauzulí smlouvy', credits: 2 },
  { icon: '🔍', label: 'Porovnání dvou dokumentů', credits: 2 },
  { icon: '🤖', label: 'AI Tazatel', credits: 5 },
  { icon: '✨', label: 'AI Chat', credits: '1k / 5 zpráv' },
]

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
    els.forEach(el => obs.observe(el))
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
      setError(err.message || 'Nepodařilo se spustit platbu. Zkus znovu.')
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
          Zpět
        </button>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div style={{ width: 80 }} />
      </nav>

      <div className={styles.content}>

        {/* HEADER */}
        <div className={`${styles.header} ${styles.animate}`} data-anim>
          <div className={styles.headerBadge}>Kredity</div>
          <h1 className={styles.title}>Zaplať jen za to,<br />co skutečně použiješ</h1>
          <p className={styles.sub}>1 kredit = 10 Kč · Kredity nevyprší · Bez předplatného · Zrušení kdykoliv</p>
        </div>

        {/* VALUE BAR */}
        <div className={`${styles.valueBar} ${styles.animate}`} data-anim>
          {[
            { icon: '⚖️', label: 'Analýza smlouvy', doc: 'Advokát', alt: '500 Kč', you: '10 Kč' },
            { icon: '🌍', label: 'Překlad dokumentu', doc: 'Překladatel', alt: '350 Kč', you: '20 Kč' },
            { icon: '📝', label: 'Šablona smlouvy', doc: 'Právní vzor', alt: '2 000 Kč', you: '20 Kč' },
          ].map(v => (
            <div key={v.label} className={styles.valueItem}>
              <span className={styles.valueIcon}>{v.icon}</span>
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
          {PLANS.map(p => (
            <button
              key={p.id}
              className={`${styles.plan} ${selected === p.id ? styles.planActive : ''} ${p.tag === 'Nejoblíbenější' ? styles.planFeatured : ''}`}
              onClick={() => setSelected(p.id)}
            >
              {p.tag && (
                <div className={`${styles.planTag} ${p.tag === 'Nejlepší hodnota' ? styles.planTagGreen : ''}`}>
                  {p.tag}
                </div>
              )}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>{p.price}</span>
                <span className={styles.planCurrency}>Kč</span>
              </div>
              <div className={styles.planCreditsRow}>
                <span className={styles.planCredits}>{p.credits} kreditů</span>
                <span className={styles.planPerCredit}>{p.perCredit} Kč/k</span>
              </div>
              <p className={styles.planDesc}>{p.desc}</p>
              <ul className={styles.planFeatures}>
                {p.features.map((f, i) => (
                  <li key={i} className={styles.planFeatureItem}>{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CHECKOUT SUMMARY */}
        <div className={`${styles.summary} ${styles.animate}`} data-anim>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryPlanName}>{plan.name}</span>
            <span className={styles.summaryCredits}>{plan.credits} kreditů</span>
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
                Zaplatit {plan.price} Kč přes Stripe
              </>
            )}
          </button>
          <p className={styles.legal}>
            🔒 Platba zabezpečena Stripe · Kredity připsány automaticky po zaplacení
          </p>
        </div>

        {/* CREDIT COSTS TABLE */}
        <div className={`${styles.creditGuide} ${styles.animate}`} data-anim>
          <div className={styles.creditGuideTitle}>Kolik stojí co?</div>
          <div className={styles.creditGuideGrid}>
            {CREDIT_COSTS.map(c => (
              <div key={c.label} className={styles.creditGuideRow}>
                <span className={styles.creditGuideIcon}>{c.icon}</span>
                <span className={styles.creditGuideLabel}>{c.label}</span>
                <span className={styles.creditGuideCost}>
                  {typeof c.credits === 'number'
                    ? `${c.credits} ${c.credits === 1 ? 'kredit' : c.credits < 5 ? 'kredity' : 'kreditů'}`
                    : c.credits}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={`${styles.faq} ${styles.animate}`} data-anim>
          {[
            { q: 'Vyprší kredity?', a: 'Ne. Kredity jsou trvalé, nevyprší a přecházejí do dalšího nákupu.' },
            { q: 'Co jsou kredity?', a: '1 kredit = 10 Kč. Každá AI operace stojí 1–5 kreditů v závislosti na složitosti. Viz tabulka výše.' },
            { q: 'Jaké dokumenty DocThink podporuje?', a: 'PDF, Word (.docx) a textové soubory (.txt) do 10 MB.' },
            { q: 'Jsou moje dokumenty v bezpečí?', a: 'Dokumenty se zpracují přes šifrované připojení a nejsou ukládány na serveru.' },
            { q: 'Jak platba funguje?', a: 'Po kliknutí tě přesměrujeme na zabezpečenou Stripe platební stránku. Po zaplacení se automaticky vrátíš a kredity se přičtou.' },
          ].map(item => (
            <div key={item.q} className={styles.faqItem}>
              <div className={styles.faqQ}>{item.q}</div>
              <div className={styles.faqA}>{item.a}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
