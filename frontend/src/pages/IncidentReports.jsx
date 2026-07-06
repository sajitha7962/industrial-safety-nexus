import { useState } from 'react'
import { useSafety } from '../context/SafetyContext'
import { useApi } from '../hooks/useApi'

export default function IncidentReports() {
  const { state } = useSafety()
  const { generateReport } = useApi()
  const [selectedReport, setSelectedReport] = useState(null)

  const handleManualTrigger = () => {
    generateReport('Zone-D', 85)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header">
        <span className="card-title">📋 AI-Generated Incident Reports</span>
        <button className="btn btn-primary" onClick={handleManualTrigger}>
          ⚡ Run Root Cause Analysis
        </button>
      </div>

      <div className="grid-2">
        {/* Report List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Safety Incident Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '450px' }}>
            {state.reports.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No incident reports generated. Facility is safe.
              </div>
            ) : (
              state.reports.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  style={{
                    padding: '0.85rem', border: `1px solid ${selectedReport?.id === r.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', background: 'var(--bg-card-2)',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{r.title}</span>
                    <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>{r.risk_score} Score</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Created: {r.created_at ? new Date(r.created_at).toLocaleString() : 'Just now'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="card">
          {selectedReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2>{selectedReport.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-critical">Critical Severity</span>
                <span className="badge badge-info">AI Generated</span>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Executive Summary</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-hover)', padding: '0.75rem', borderRadius: 6 }}>
                  {selectedReport.summary}
                </p>
              </div>

              {selectedReport.ai_explanation && (
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>AI Root Cause Chain Analysis</h4>
                  <pre style={{
                    fontSize: '0.8rem', color: 'var(--text-primary)', background: '#090f19',
                    padding: '0.75rem', borderRadius: 6, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)'
                  }}>
                    {selectedReport.ai_explanation}
                  </pre>
                </div>
              )}

              {selectedReport.recommended_actions && selectedReport.recommended_actions.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Immediate Recommended Actions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedReport.recommended_actions.map((act, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-card-2)', padding: '0.4rem', borderRadius: 4 }}>
                        <span style={{ background: 'var(--accent)', color: '#fff', width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          {i + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select a report from the list to view the analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
