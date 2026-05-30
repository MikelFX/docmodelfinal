'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Stats {
  total: number
  today: number
  yesterday: number
  activeUsersToday: number
  chart: { date: string; count: number }[]
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStats = async (s: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`)
      if (res.status === 403) { setError('Nesprávné heslo'); setLoading(false); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStats(data)
      setAuthed(true)
    } catch {
      setError('Chyba načítání')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className={styles.login}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>🛡️</div>
          <h1 className={styles.loginTitle}>Admin</h1>
          <input
            className={styles.input}
            type="password"
            placeholder="Heslo"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats(secret)}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.loginBtn} onClick={() => fetchStats(secret)} disabled={loading}>
            {loading ? 'Načítám…' : 'Přihlásit'}
          </button>
        </div>
      </div>
    )
  }

  const chartData = stats?.chart.slice().reverse() ?? []
  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <span className={styles.navTitle}>🛡️ DocThink Admin</span>
        <button className={styles.refreshBtn} onClick={() => fetchStats(secret)} disabled={loading}>
          {loading ? '…' : '↻ Obnovit'}
        </button>
      </nav>

      <div className={styles.content}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardNum}>{stats?.total ?? 0}</div>
            <div className={styles.cardLabel}>Analýz celkem</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardNum}>{stats?.today ?? 0}</div>
            <div className={styles.cardLabel}>Dnes</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardNum}>{stats?.yesterday ?? 0}</div>
            <div className={styles.cardLabel}>Včera</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardNum}>{stats?.activeUsersToday ?? 0}</div>
            <div className={styles.cardLabel}>Aktivní uživatelé dnes</div>
          </div>
        </div>

        <div className={styles.chartBox}>
          <h2 className={styles.chartTitle}>Analýzy — posledních 7 dní</h2>
          <div className={styles.chart}>
            {chartData.map((d, i) => (
              <div key={i} className={styles.barWrap}>
                <div className={styles.barCount}>{d.count || ''}</div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ height: `${Math.max(d.count ? 4 : 0, (d.count / maxCount) * 100)}%` }}
                  />
                </div>
                <div className={styles.barDate}>{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
