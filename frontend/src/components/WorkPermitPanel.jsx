import { useSafety } from '../context/SafetyContext'
import { format } from 'date-fns'

export default function WorkPermitPanel() {
  const { state } = useSafety()
  const { permits } = state

  const activePermits = permits.filter(p => p.status === 'active')

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <span className="card-title">📝 Active Work Permits</span>
        <span className="badge badge-info">{activePermits.length}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
        {activePermits.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No active permits for this zone.
          </div>
        ) : (
          activePermits.map(permit => {
            const isHotWork = permit.permit_type === 'hot_work'
            const badgeClass = isHotWork ? 'high' : 'info'

            return (
              <div key={permit.permit_id} className="card" style={{ padding: '0.75rem', background: 'var(--bg-card-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className={`badge badge-${badgeClass}`} style={{ fontSize: '0.65rem' }}>
                    {permit.permit_type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {permit.permit_id}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  📍 {permit.location} ({permit.zone})
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supervisor: <span style={{ color: 'var(--text-primary)' }}>{permit.issued_by}</span>
                </div>

                {permit.worker_names && permit.worker_names.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {permit.worker_names.map(w => (
                      <span key={w} style={{ fontSize: '0.65rem', background: 'var(--bg-hover)', color: 'var(--text-secondary)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>
                        👤 {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
