'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { getDGT } from '@/lib/i18n-dg'

const PLANS = [
  { id: 'starter', credits: 10, priceEur: 4,  perCreditEur: '0.40' },
  { id: 'pro',     credits: 40, priceEur: 14, perCreditEur: '0.35' },
  { id: 'team',    credits: 120, priceEur: 40, perCreditEur: '0.33' },
]

const CREDIT_COSTS = [
  { icon: '🛡️', credits: 1 },
  { icon: '⚠️', credits: 1 },
  { icon: '🔍', credits: 2 },
  { icon: '📋', credits: 2 },
  { icon: '🏠', credits: 2 },
  { icon: '💬', credits: null },
]

// Per-language content
const KOUPIT_CONTENT: Record<string, {
  badge: string
  title: string
  sub: string
  back: string
  valueItems: { icon: string; label: string; alt: string; you: string }[]
  planTags: (string | null)[]
  planDescs: string[]
  planFeatures: string[][]
  creditCostLabels: string[]
  guideTitle: string
  guideFree: string
  creditLabel: (n: number | null) => string
  priceLabel: string
  countLabel: string
  totalLabel: string
  payBtn: (price: number) => string
  legal: string
  faq: { q: string; a: string }[]
}> = {
  cs: {
    badge: '🛡️ Ochrana smluv s AI',
    title: 'Získejte kredity a chraňte se',
    sub: 'Každý kredit = jedna analýza smlouvy s verdiktem, riziky a doporučením.',
    back: 'Zpět',
    valueItems: [
      { icon: '⚖️', label: 'Advokát', alt: 'Konzultace: €50–200', you: 'DocThink: od €0.40' },
      { icon: '🛡️', label: 'Ochrana', alt: 'Nevýhodná klauzule stojí tisíce', you: 'zachytí za sekundy' },
      { icon: '📋', label: 'Rychlost', alt: 'Čtení smlouvy: 30–60 min', you: '30 sekund' },
    ],
    planTags: [null, '⭐ Nejoblíbenější', '💼 Pro firmy'],
    planDescs: [
      'Ideální pro příležitostnou kontrolu smluv.',
      'Pro pravidelné uživatele bez omezení.',
      'Pro firmy a právníky za nejlepší cenu.',
    ],
    planFeatures: [
      ['10 analýz smluv', 'Detekce rizik', 'Chat s dokumentem', 'Verdikt: podepsat / upravit / odmítnout'],
      ['40 analýz smluv', 'Prioritní zpracování', 'Chat s dokumentem', 'Kompletní rozbor každé smlouvy'],
      ['120 analýz smluv', 'Nejnižší cena za analýzu', 'Vhodné pro tým', 'Neomezený chat s dokumentem'],
    ],
    creditCostLabels: ['Analýza smlouvy', 'Detekce rizik', 'Hluboká kontrola dokumentu', 'Kontrola pracovní smlouvy', 'Analýza nájemní smlouvy', 'Chat s dokumentem'],
    guideTitle: 'Co stojí jeden kredit?',
    guideFree: 'zdarma',
    creditLabel: (n) => n === null ? 'zdarma' : n === 1 ? '1 kredit' : `${n} kredity`,
    priceLabel: 'Cena za kredit',
    countLabel: 'Počet kreditů',
    totalLabel: 'Celkem',
    payBtn: (p) => `Zaplatit €${p}`,
    legal: 'Jednorázová platba · Bez předplatného · Kredity nevypršejí',
    faq: [
      { q: 'Jak dlouho kredity platí?', a: 'Kredity nevypršejí — zůstávají na vašem účtu, dokud je nespotřebujete.' },
      { q: 'Co dostanu za jeden kredit?', a: 'Kompletní analýzu smlouvy: verdikt, seznam rizik, chybějící klauzule a doporučení. Chat zdarma.' },
      { q: 'Je platba bezpečná?', a: 'Platby zpracovává Stripe. Vaše karta není ukládána na našich serverech.' },
      { q: 'Mohu dostat fakturu?', a: 'Ano, Stripe automaticky pošle potvrzení. Pro fakturu s IČ nás kontaktujte.' },
    ],
  },
  en: {
    badge: '🛡️ AI Contract Protection',
    title: 'Get credits and stay protected',
    sub: 'Each credit = one contract analysis with verdict, risks and recommendation.',
    back: 'Back',
    valueItems: [
      { icon: '⚖️', label: 'Lawyer', alt: 'Consultation: €50–200', you: 'DocThink: from €0.40' },
      { icon: '🛡️', label: 'Protection', alt: 'Unfair clause costs thousands', you: 'caught in seconds' },
      { icon: '📋', label: 'Speed', alt: 'Reading contract: 30–60 min', you: '30 seconds' },
    ],
    planTags: [null, '⭐ Most popular', '💼 For teams'],
    planDescs: [
      'Perfect for occasional contract checks.',
      'For regular users without limits.',
      'For companies and lawyers at the best price.',
    ],
    planFeatures: [
      ['10 contract analyses', 'Risk detection', 'Chat with document', 'Verdict: sign / modify / reject'],
      ['40 contract analyses', 'Priority processing', 'Chat with document', 'Full breakdown of every contract'],
      ['120 contract analyses', 'Lowest price per analysis', 'Suitable for teams', 'Unlimited chat with documents'],
    ],
    creditCostLabels: ['Contract analysis', 'Risk detection', 'Deep document review', 'Employment contract check', 'Rental agreement analysis', 'Chat with document'],
    guideTitle: 'What does one credit cost?',
    guideFree: 'free',
    creditLabel: (n) => n === null ? 'free' : `${n} credit${n === 1 ? '' : 's'}`,
    priceLabel: 'Price per credit',
    countLabel: 'Number of credits',
    totalLabel: 'Total',
    payBtn: (p) => `Pay €${p}`,
    legal: 'One-time payment · No subscription · Credits never expire',
    faq: [
      { q: 'Do credits expire?', a: 'No. Credits never expire — they stay on your account until you use them.' },
      { q: 'What do I get for one credit?', a: 'A full contract analysis: verdict, risk list, missing clauses and recommendation. Chat is free.' },
      { q: 'Is payment secure?', a: 'Payments are processed by Stripe. Your card details are never stored on our servers.' },
      { q: 'Can I get an invoice?', a: 'Yes, Stripe automatically sends a confirmation. Contact us for a VAT invoice.' },
    ],
  },
  de: {
    badge: '🛡️ KI-Vertragsschutz',
    title: 'Credits kaufen und geschützt bleiben',
    sub: 'Jeder Credit = eine Vertragsanalyse mit Urteil, Risiken und Empfehlung.',
    back: 'Zurück',
    valueItems: [
      { icon: '⚖️', label: 'Anwalt', alt: 'Beratung: €50–200', you: 'DocThink: ab €0.40' },
      { icon: '🛡️', label: 'Schutz', alt: 'Ungünstige Klausel kostet tausende', you: 'in Sekunden erkannt' },
      { icon: '📋', label: 'Geschwindigkeit', alt: 'Vertrag lesen: 30–60 Min', you: '30 Sekunden' },
    ],
    planTags: [null, '⭐ Beliebteste', '💼 Für Teams'],
    planDescs: [
      'Ideal für gelegentliche Vertragsprüfungen.',
      'Für regelmäßige Nutzer ohne Einschränkungen.',
      'Für Unternehmen und Anwälte zum besten Preis.',
    ],
    planFeatures: [
      ['10 Vertragsanalysen', 'Risikoerkennung', 'Chat mit Dokument', 'Urteil: unterzeichnen / ändern / ablehnen'],
      ['40 Vertragsanalysen', 'Prioritätsverarbeitung', 'Chat mit Dokument', 'Vollständige Analyse jedes Vertrags'],
      ['120 Vertragsanalysen', 'Niedrigster Preis pro Analyse', 'Geeignet für Teams', 'Unbegrenzter Chat'],
    ],
    creditCostLabels: ['Vertragsanalyse', 'Risikoerkennung', 'Tiefe Dokumentprüfung', 'Arbeitsvertragsprüfung', 'Mietvertragsanalyse', 'Chat mit Dokument'],
    guideTitle: 'Was kostet ein Credit?',
    guideFree: 'kostenlos',
    creditLabel: (n) => n === null ? 'kostenlos' : `${n} Credit${n === 1 ? '' : 's'}`,
    priceLabel: 'Preis pro Credit',
    countLabel: 'Anzahl Credits',
    totalLabel: 'Gesamt',
    payBtn: (p) => `€${p} bezahlen`,
    legal: 'Einmalige Zahlung · Kein Abo · Credits verfallen nie',
    faq: [
      { q: 'Verfallen Credits?', a: 'Nein. Credits verfallen nie — sie bleiben auf Ihrem Konto bis zur Verwendung.' },
      { q: 'Was bekomme ich für einen Credit?', a: 'Vollständige Vertragsanalyse: Urteil, Risiken, fehlende Klauseln und Empfehlung. Chat kostenlos.' },
      { q: 'Ist die Zahlung sicher?', a: 'Zahlungen werden von Stripe verarbeitet. Ihre Kartendaten werden nie gespeichert.' },
      { q: 'Kann ich eine Rechnung bekommen?', a: 'Ja, Stripe sendet automatisch eine Bestätigung. Für eine MwSt.-Rechnung kontaktieren Sie uns.' },
    ],
  },
}

// Fallback to English for languages without specific content
function getContent(lang: string) {
  return KOUPIT_CONTENT[lang] ?? KOUPIT_CONTENT.en
}

const PLAN_NAMES = ['Starter', 'Pro', 'Business']

export default function KoupitPage() {
  const [selected, setSelected] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { lang } = useLanguage()
  const k = getContent(lang)

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
          {k.back}
        </button>
        <div className={styles.logo}>🛡️ DocThink</div>
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
              <span className={styles.valueIcon}>{v.icon}</span>
              <div className={styles.valueText}>
                <span className={styles.valueLabel}>{v.label}</span>
                <div className={styles.valuePrices}>
                  <span className={styles.valueAlt}>{v.alt}</span>
                  <span className={styles.valueSep}>→</span>
                  <span className={styles.valueYou}>{v.you}</span>
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
              {k.planTags[i] && (
                <div className={`${styles.planTag} ${i === 2 ? styles.planTagGreen : ''}`}>
                  {k.planTags[i]}
                </div>
              )}
              <div className={styles.planName}>{PLAN_NAMES[i]}</div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>{p.priceEur}</span>
                <span className={styles.planCurrency}>€</span>
              </div>
              <div className={styles.planCreditsRow}>
                <span className={styles.planCredits}>{k.creditLabel(p.credits)}</span>
                <span className={styles.planPerCredit}>€{p.perCreditEur}/cr</span>
              </div>
              <p className={styles.planDesc}>{k.planDescs[i]}</p>
              <ul className={styles.planFeatures}>
                {k.planFeatures[i].map((f, j) => (
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
            <span className={styles.summaryCredits}>{k.creditLabel(plan.credits)}</span>
          </div>
          <div className={styles.summaryBody}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{k.priceLabel}</span>
              <span className={styles.summaryVal}>€{plan.perCreditEur}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{k.countLabel}</span>
              <span className={styles.summaryVal}>{plan.credits}×</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryTotal}>{k.totalLabel}</span>
              <span className={styles.summaryTotalVal}>€{plan.priceEur}</span>
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
                {k.payBtn(plan.priceEur)}
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
                <span className={styles.creditGuideLabel}>{k.creditCostLabels[i]}</span>
                <span className={styles.creditGuideCost}>{k.creditLabel(c.credits)}</span>
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
