import { useState } from 'react'
import { useSafety } from '../context/SafetyContext'

export default function PPEDetectionFeed() {
  const { state } = useSafety()
  const [camera, setCamera] = useState('CAM-Zone-D')

  // Find CCTV detections
  const hasViolation = state.triggeredRules.includes('PPE_ZONE')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header">
        <span className="card-title">📷 YOLOv8 PPE Compliance Feed</span>
        <span className="badge badge-info">CCTV Live</span>
      </div>

      <div className="grid-2">
        {/* CCTV Feed Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{camera} - Hazardous Area</span>
            <select
              value={camera}
              onChange={e => setCamera(e.target.value)}
              style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: 4 }}
            >
              <option value="CAM-Zone-D">Zone D (Confined Entry)</option>
              <option value="CAM-Zone-A">Zone A (Processing Facility)</option>
            </select>
          </div>

          {/* Interactive CCTV canvas simulation */}
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16/9',
            background: '#040810', borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: hasViolation ? '2px solid var(--crit)' : '1px solid var(--border)'
          }}>
            {/* Simulated Frame */}
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              🎥 Simulated CCTV Feed
            </div>

            {/* Bounding box simulation for demo */}
            {hasViolation && camera === 'CAM-Zone-D' && (
              <div style={{
                position: 'absolute', top: '30%', left: '40%', width: '20%', height: '50%',
                border: '2px solid var(--crit)', borderRadius: 2, pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
              }}>
                <span style={{
                  position: 'absolute', top: -18, left: -2, background: 'var(--crit)',
                  color: '#fff', fontSize: '0.6rem', padding: '0 0.3rem', borderRadius: '2px 2px 0 0',
                  fontWeight: 700
                }}>
                  NO_HARDHAT (91%)
                </span>
              </div>
            )}

            <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
              REC • LIVE
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Compliance Analytics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATUS</div>
                <div style={{ fontWeight: 700, color: hasViolation ? 'var(--crit)' : 'var(--safe)' }}>
                  {hasViolation ? 'VIOLATION DETECTED' : 'FULLY COMPLIANT'}
                </div>
              </div>
              <span className={`badge badge-${hasViolation ? 'critical' : 'safe'}`}>
                {hasViolation ? 'Non-Compliant' : 'Compliant'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Class</span>
                <span style={{ color: 'var(--text-secondary)' }}>Hardhat, Vest, Gloves</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Required Zone PPE</span>
                <span style={{ color: 'var(--text-secondary)' }}>Full Gear (Class-3)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Violation Logged</span>
                <span style={{ color: 'var(--text-secondary)' }}>{hasViolation ? 'Just now' : 'None in current shift'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
