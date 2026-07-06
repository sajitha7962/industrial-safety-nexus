import { useEffect, useRef } from 'react'
import { useSafety } from '../context/SafetyContext'

const SIZE  = 200
const SW    = 14    // stroke width
const R     = 75    // clean radius to fit nicely inside 200px SVG
const CX    = SIZE / 2
const CY    = 90    // center shifted up to allow space below for badge inside the viewbox
const START = 220   // degrees: start of arc
const SWEEP = 280   // total sweep degrees

function polarToCart(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCart(cx, cy, r, startAngle)
  const e = polarToCart(cx, cy, r, endAngle)
  const lg = endAngle - startAngle > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y}`
}

export default function RiskGauge() {
  const { state } = useSafety()
  const { riskScore, riskLevel, riskColor } = state
  const arcRef    = useRef(null)

  // Arc calculation
  const startAngle = START - SWEEP / 2
  const endAngle   = startAngle + SWEEP
  const angle      = startAngle + (riskScore / 100) * SWEEP

  // Track arc
  const trackPath = describeArc(CX, CY, R, startAngle, endAngle)
  const fillPath  = riskScore > 0 ? describeArc(CX, CY, R, startAngle, angle) : ''

  const levelLabel = { SAFE: '✅ SAFE', WARNING: '⚠️ WARNING', HIGH: '🔶 HIGH', CRITICAL: '🚨 CRITICAL' }[riskLevel] || riskLevel

  return (
    <div className={`card card-${riskLevel.toLowerCase()} gradient-border`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', height: '100%', minHeight: '340px' }}>
      
      <div className="card-title" style={{ alignSelf: 'flex-start', marginBottom: '0.25rem' }}>
        ⚡ Risk Score
      </div>

      <div style={{ position: 'relative', width: SIZE, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
        <svg width={SIZE} height={150} viewBox={`0 0 ${SIZE} 150`} style={{ overflow: 'visible' }}>
          {/* Track */}
          <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} strokeLinecap="round" />
          {/* Fill arc */}
          {fillPath && (
            <path ref={arcRef} d={fillPath} fill="none" stroke={riskColor}
              strokeWidth={SW} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${riskColor}60)`, transition: 'd 0.8s ease' }}
            />
          )}
          {/* Score text */}
          <text x={CX} y={CY + 8} textAnchor="middle" fill={riskColor}
            fontSize="36" fontWeight="800" fontFamily="JetBrains Mono, monospace"
            style={{ filter: `drop-shadow(0 0 10px ${riskColor}40)` }}>
            {riskScore}
          </text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="500">
            / 100
          </text>
        </svg>
      </div>

      <div className={`badge badge-${riskLevel.toLowerCase()}`} style={{ padding: '0.35rem 1.25rem', fontSize: '0.75rem', zIndex: 10, marginBottom: '0.5rem' }}>
        {levelLabel}
      </div>

      {/* Triggered rules */}
      <div style={{ width: '100%', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
        {state.triggeredRules.length > 0 ? (
          state.triggeredRules.slice(0, 2).map(rule => (
            <div key={rule} style={{
              fontSize: '0.65rem', color: 'var(--crit)',
              background: 'var(--crit-bg)', padding: '0.2rem 0.5rem',
              borderRadius: 4, textAlign: 'center',
              fontFamily: 'var(--font-mono)', border: '1px solid rgba(239,68,68,0.2)'
            }}>
              ⚡ {rule}
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No rules triggered
          </div>
        )}
      </div>
    </div>
  )
}
