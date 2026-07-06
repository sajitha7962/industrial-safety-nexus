import { NavLink } from 'react-router-dom'
import { useSafety } from '../context/SafetyContext'

const NAV = [
  { to: '/',        icon: '📊', label: 'Dashboard' },
  { to: '/alerts',  icon: '🚨', label: 'Alerts' },
  { to: '/cctv',   icon: '📷', label: 'CCTV / PPE' },
  { to: '/reports', icon: '📋', label: 'Reports' },
  { to: '/history', icon: '📈', label: 'Trends' },
  { to: '/permits', icon: '📝', label: 'Permits' },
]

export default function Sidebar() {
  const { state } = useSafety()
  const { alerts, riskScore, riskLevel } = state

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved)
  const critAlerts   = activeAlerts.filter(a => a.severity === 'CRITICAL')

  const levelClass = { SAFE: 'safe', WARNING: 'warning', HIGH: 'high', CRITICAL: 'critical' }[riskLevel] || 'safe'

  return (
    <nav className="sidebar">
      {/* Risk Overview */}
      <div style={{ padding: '0.75rem 1rem', margin: '0 0.75rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Global Risk
        </div>
        {/* Risk bar */}
        <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.4rem' }}>
          <div style={{
            height: '100%',
            width:  `${riskScore}%`,
            background: `var(--${levelClass === 'safe' ? 'safe' : levelClass === 'warning' ? 'warn' : levelClass === 'high' ? 'high' : 'crit'})`,
            borderRadius: 2,
            transition: 'width 1s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge badge-${levelClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>{riskLevel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{riskScore}</span>
        </div>
      </div>

      <div className="section-title">Navigation</div>

      {NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span>{label}</span>
          {label === 'Alerts' && activeAlerts.length > 0 && (
            <span className="nav-badge" style={{ backgroundColor: 'var(--crit)' }}>{activeAlerts.length}</span>
          )}
          {label === 'Reports' && activeAlerts.length > 0 && (
            <span className="nav-badge">{critAlerts.length || activeAlerts.length}</span>
          )}
        </NavLink>
      ))}

      <div className="divider" style={{ margin: '1rem 0.75rem' }} />
      <div className="section-title">System Status</div>

      {/* Zone list */}
      {Object.entries(state.zoneBreakdown).map(([zone, info]) => (
        <div key={zone} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 1.25rem', fontSize: '0.75rem',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{zone}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: info.color, fontWeight: 600 }}>{info.risk_score}</span>
        </div>
      ))}

      <div style={{ padding: '1.5rem 1rem 0.5rem', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          SafetyAI v1.0 • AI-Powered
        </div>
      </div>
    </nav>
  )
}
