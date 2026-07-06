import { useSafety } from '../context/SafetyContext'
import { useApi } from '../hooks/useApi'
import { formatDistanceToNow } from 'date-fns'

export default function AlertsPanel() {
  const { state } = useSafety()
  const { acknowledgeAlert } = useApi()
  const { alerts } = state

  const activeAlerts = alerts.filter(a => !a.resolved)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <span className="card-title">⚠️ Active Alerts</span>
        <span className="badge badge-critical">{activeAlerts.length}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
        {activeAlerts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No active alerts. Facility status nominal.
          </div>
        ) : (
          activeAlerts.map(alert => {
            const isCrit = alert.severity === 'CRITICAL'
            const isHigh = alert.severity === 'HIGH'
            const badgeClass = isCrit ? 'critical' : isHigh ? 'high' : 'warning'

            return (
              <div key={alert.id} className={`card card-${badgeClass}`} style={{ padding: '0.75rem', margin: '1px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span className={`badge badge-${badgeClass}`} style={{ fontSize: '0.6rem' }}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {alert.created_at ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }) : ''}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {alert.message}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>
                    📍 {alert.zone}
                  </span>

                  {!alert.acknowledged ? (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--safe)' }}>
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
