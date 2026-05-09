'use client'

import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'
import styles from './docguard-landing.module.css'

const STEPS = [
  { icon: '📷', step: '1', title: 'Vyfotit nebo nahrát', desc: 'Foť smlouvu telefonem nebo nahraj PDF/DOCX soubor.' },
  { icon: '🤖', step: '2', title: 'AI analyzuje', desc: 'Claude AI prochází každou klauzuli a hledá rizika za ~10 sekund.' },
  { icon: '🛡️', step: '3', title: 'Jasný výsledek', desc: 'Verdikt + seznam rizik + chat. Žádné právní hantýrky.' },
]

const FEATURES = [
  { icon: '🔒', title: 'Bez ukládání dat', desc: 'Vše probíhá v paměti prohlížeče. Po zavření stránky zmizí vše.' },
  { icon: '🧠', title: 'Claude AI', desc: 'Pohání ho nejlepší AI pro porozumění právním textům.' },
  { icon: '⚡', title: 'Analýza za 10s', desc: 'Výsledky do 10 sekund — ne hodiny čekání na advokáta.' },
  { icon: '💬', title: 'Chat s dokumentem', desc: 'Po analýze se doptávej na cokoliv ohledně smlouvy.' },
]

const PLANS = [
  { name: 'Starter', credits: 10, price: '€4', per: '€0.40 / analýza' },
  { name: 'Pro', credits: 40, price: '€14', per: '€0.35 / analýza', highlight: true },
  { name: 'Business', credits: 120, price: '€40', per: '€0.33 / analýza' },
]

export default function DocGuardLanding() {
  const router = useRouter()
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const els = document.querySelectorAll('[data-anim]')
    observerRef.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible)
            observerRef.current?.unobserve(e.target)
          }
        }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => {
      el.classList.remove(styles.visible)
      observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className={styles.wrap}>
      {/* Ambient orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoShield}>🛡️</span>
          <span className={styles.logoWord}>DocGuard</span>
        </div>
        <div className={styles.navRight}>
          <SignedOut>
            <button className={styles.navLink} onClick={() => router.push('/sign-in')}>
              Přihlásit se
            </button>
            <button className={styles.navCta} onClick={() => router.push('/sign-up')}>
              Spustit DocGuard
            </button>
          </SignedOut>
          <SignedIn>
            <button className={styles.navCta} onClick={() => router.push('/app')}>
              Spustit DocGuard
            </button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>🛡️ Chráním tvé zájmy</div>
        <h1 className={styles.heroTitle}>
          Chráním tě před
          <br />
          <span className={styles.heroAccent}>špatnou smlouvou.</span>
        </h1>
        <p className={styles.heroSub}>
          Vyfot nebo nahraj smlouvu. Za 10 sekund dostaneš verdikt, seznam rizik
          a doporučení — bez advokáta, bez čekání.
        </p>
        <div className={styles.heroActions}>
          <SignedOut>
            <button className={styles.heroCta} onClick={() => router.push('/sign-up')}>
              Začít zdarma →
            </button>
            <button className={styles.heroSecondary} onClick={() => router.push('/sign-in')}>
              Přihlásit se
            </button>
          </SignedOut>
          <SignedIn>
            <button className={styles.heroCta} onClick={() => router.push('/app')}>
              Spustit DocGuard →
            </button>
          </SignedIn>
        </div>

        {/* Hero mockup */}
        <div className={styles.heroMockup}>
          <div className={styles.mockupCard}>
            <div className={styles.mockupHeader}>
              <span className={styles.mockupDot} style={{ background: '#ef4444' }} />
              <span className={styles.mockupDot} style={{ background: '#eab308' }} />
              <span className={styles.mockupDot} style={{ background: '#22c55e' }} />
              <span className={styles.mockupFilename}>najemni_smlouva.pdf</span>
            </div>
            <div className={styles.mockupVerdict}>
              <div className={styles.mockupVerdictCircle}>⚠️</div>
              <div>
                <div className={styles.mockupVerdictLabel}>Doporučuji upravit</div>
                <div className={styles.mockupVerdictSub}>3 rizika nalezena</div>
              </div>
            </div>
            <div className={styles.mockupRisk}>
              <span className={styles.mockupRiskDot} style={{ background: '#ef4444' }} />
              <span className={styles.mockupRiskText}>Jednostranné vypovězení bez důvodu</span>
            </div>
            <div className={styles.mockupRisk}>
              <span className={styles.mockupRiskDot} style={{ background: '#eab308' }} />
              <span className={styles.mockupRiskText}>Chybí kauce — výše není specifikována</span>
            </div>
          </div>
          <div className={styles.mockupGlow} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${styles.steps} ${styles.animate}`} data-anim>
        <div className={styles.sectionLabel}>Jak to funguje</div>
        <div className={styles.stepsGrid}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={styles.stepCard}
              style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
            >
              <div className={styles.stepNum}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className={`${styles.features} ${styles.animate}`} data-anim>
        <div className={styles.sectionLabel}>Proč DocGuard</div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={styles.featureCard}
              style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className={`${styles.pricing} ${styles.animate}`} data-anim>
        <div className={styles.sectionLabel}>Ceník</div>
        <h2 className={styles.pricingTitle}>Jeden kredit = jedna analýza</h2>
        <p className={styles.pricingSub}>Žádné předplatné. Platíš jen za to, co použiješ.</p>
        <div className={styles.plansGrid}>
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`${styles.planCard} ${p.highlight ? styles.planHighlight : ''}`}
              style={{ '--delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              {p.highlight && <div className={styles.planBadge}>Nejoblíbenější</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}</div>
              <div className={styles.planCredits}>{p.credits} analýz</div>
              <div className={styles.planPer}>{p.per}</div>
            </div>
          ))}
        </div>
        <button className={styles.heroCta} onClick={() => router.push('/koupit')}>
          Koupit kredity →
        </button>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <span className={styles.logoShield}>🛡️</span>
          <span className={styles.logoWord}>DocGuard</span>
        </div>
        <p className={styles.footerSub}>© 2025 DocGuard. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  )
}
