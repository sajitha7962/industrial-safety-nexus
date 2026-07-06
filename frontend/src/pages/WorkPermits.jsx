import { useState } from 'react'
import { useSafety } from '../context/SafetyContext'
import { useApi } from '../hooks/useApi'

export default function WorkPermits() {
  const { state } = useSafety()
  const { createPermit } = useApi()
  const [permitType, setPermitType] = useState('hot_work')
  const [zone, setZone] = useState('Zone-D')
  const [supervisor, setSupervisor] = useState('Ahmed Al-Rashid')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const handleIssuePermit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!supervisor || !supervisor.trim()) {
      showToast('error', 'Safety Supervisor name is required')
      return
    }
    if (supervisor.length < 3) {
      showToast('error', 'Safety Supervisor name must be at least 3 characters')
      return
    }

    setIsLoading(true)
    try {
      await createPermit({
        permit_type: permitType,
        location: `${zone} Sub-station`,
        zone,
        issued_by: supervisor.trim(),
        worker_names: ['Worker-902', 'Worker-113'],
        expires_at: new Date(Date.now() + 4 * 3600000).toISOString(),
        notes: `Routine ${permitType.replace('_', ' ')} maintenance`
      })
      showToast('success', `Permit successfully created and issued to ${zone}!`)
      setSupervisor('Ahmed Al-Rashid') // Reset form values or keep defaults
    } catch (err) {
      showToast('error', err.message || 'API error: failed to create permit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header">
        <span className="card-title">📝 Work Permit Administration & Control</span>
      </div>

      <div className="grid-2">
        {/* Issue Permit Form */}
        <div className="card">
          <h3>Issue Safety Work Permit</h3>
          <form onSubmit={handleIssuePermit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permit Class</label>
              <select
                value={permitType} onChange={e => setPermitType(e.target.value)}
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.45rem', borderRadius: 6 }}
              >
                <option value="hot_work">Hot Work Permit (Welding, Cutting)</option>
                <option value="confined_space">Confined Space Entry</option>
                <option value="electrical">Electrical Isolation</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operational Zone</label>
              <select
                value={zone} onChange={e => setZone(e.target.value)}
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.45rem', borderRadius: 6 }}
              >
                <option value="Zone-D">Zone D (Hazardous Area)</option>
                <option value="Zone-A">Zone A (Processing Area)</option>
                <option value="Zone-B">Zone B (Reaction Area)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Safety Supervisor</label>
              <input
                type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)}
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.45rem', borderRadius: 6 }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Issuing Permit...' : 'Create and Issue Permit'}
            </button>
          </form>
          
          {toast && (
            <div 
              style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                fontSize: '0.85rem',
                backgroundColor: toast.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: toast.type === 'success' ? '#4ade80' : '#f87171',
                border: toast.type === 'success' ? '1px solid #22c55e' : '1px solid #ef4444'
              }}
            >
              {toast.message}
            </div>
          )}
        </div>

        {/* Current active list */}
        <div className="card">
          <h3>Issued Permits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {state.permits.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active permits currently issued.
              </div>
            ) : (
              state.permits.map(permit => (
                <div key={permit.permit_id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{permit.permit_id}</span>
                    <span className="badge badge-info">{permit.permit_type}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Supervisor: {permit.issued_by} | Zone: {permit.zone}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
