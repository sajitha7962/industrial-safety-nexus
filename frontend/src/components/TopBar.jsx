import { useSafety } from '../context/SafetyContext'
import { format } from 'date-fns'

const ICONS = {
  '⚠️': '⚠️',
  '🔥': '🔥',
  '🚨': '🚨',
}

export default function TopBar() {
  const { state } = useSafety()
  const { riskScore, riskLevel, riskColor, connected, lastUpdate } = state

  const levelClass = {
    SAFE:     'safe',
    WARNING:  'warning',
    HIGH:     'high',
    CRITICAL: 'critical',
  }[riskLevel] || 'safe'

  return (
    <header className="topbar">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            SafetyAI
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            INDUSTRIAL INTELLIGENCE PLATFORM
          </div>
        </div>
      </div>

      {/* Center — Risk indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className={`badge badge-${levelClass}`} style={{ padding: '0.3rem 1rem', fontSize: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800 }}>
            {riskScore}
          </span>
          <span>/ 100</span>
          <span>•</span>
          <span>{riskLevel}</span>
        </div>
      </div>

      {/* Right — Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span className={`pulse-dot ${connected ? 'live' : ''}`}
            style={{ background: connected ? 'var(--safe)' : 'var(--text-muted)' }} />
          {connected ? 'Live' : 'Reconnecting…'}
        </div>
        {lastUpdate && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {format(new Date(lastUpdate), 'HH:mm:ss')}
          </div>
        )}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🏭 Al-Fajr Industrial Facility
        </div>
      </div>
    </header>
  )
}
