import { useSafety } from '../context/SafetyContext'
import { format } from 'date-fns'

export default function ShiftInfo() {
  const { state } = useSafety()
  const { shift } = state

  return (
    <div className="card" style={{ padding: '1rem', background: 'var(--bg-card-2)' }}>
      <div className="card-title" style={{ marginBottom: '0.5rem' }}>👥 Shift Information</div>
      {shift ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Shift:</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent)' }}>{shift.shift_type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Supervisor:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{shift.supervisor}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Workers:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{shift.worker_count}</span>
          </div>
          {shift.start_time && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Started At:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {format(new Date(shift.start_time), 'HH:mm')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
          No active shift logged.
        </div>
      )}
    </div>
  )
}
