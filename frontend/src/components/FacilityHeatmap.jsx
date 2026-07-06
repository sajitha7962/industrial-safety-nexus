import { useSafety } from '../context/SafetyContext'

/* Zone layout (approximate positions as % of SVG canvas) */
const ZONE_LAYOUT = {
  'Zone-A':       { x: 10,  y: 10,  w: 35, h: 38, label: 'Zone A\nProcessing' },
  'Zone-B':       { x: 55,  y: 10,  w: 35, h: 38, label: 'Zone B\nReaction' },
  'Zone-C':       { x: 10,  y: 55,  w: 35, h: 35, label: 'Zone C\nStorage' },
  'Zone-D':       { x: 55,  y: 55,  w: 35, h: 35, label: 'Zone D\nHazardous' },
  'Control-Room': { x: 35,  y: 42,  w: 16, h: 12, label: 'Control' },
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function FacilityHeatmap() {
  const { state } = useSafety()
  const { zoneBreakdown } = state

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-header">
        <span className="card-title">🏭 Facility Heatmap</span>
        <span className="badge badge-info">Live</span>
      </div>

      <svg viewBox="0 0 100 100" style={{ width: '100%', borderRadius: 8 }}>
        {/* Background */}
        <rect width="100" height="100" fill="#0a1220" rx="2" />
        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="#1e3048" strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="#1e3048" strokeWidth="0.3" />
          </g>
        ))}

        {/* Zones */}
        {Object.entries(ZONE_LAYOUT).map(([zone, pos]) => {
          const info  = zoneBreakdown[zone]
          const color = info?.color || '#22c55e'
          const score = info?.risk_score || 0
          const [lbl1, lbl2] = pos.label.split('\n')
          const cx = pos.x + pos.w / 2
          const cy = pos.y + pos.h / 2

          return (
            <g key={zone}>
              {/* Zone background */}
              <rect
                x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                fill={hexToRgba(color, 0.12)}
                stroke={color}
                strokeWidth={score > 60 ? 0.8 : 0.4}
                rx="1.5"
                style={{ transition: 'fill 1s, stroke 1s' }}
              />
              {/* Glow effect for high risk */}
              {score > 60 && (
                <rect
                  x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  rx="1.5"
                  style={{ opacity: 0.3, filter: `blur(2px)` }}
                />
              )}
              {/* Zone label */}
              <text x={cx} y={cy - 3} textAnchor="middle" fill={color}
                fontSize={zone === 'Control-Room' ? '2.5' : '3.5'} fontWeight="700"
                fontFamily="Inter, sans-serif">
                {lbl1}
              </text>
              {lbl2 && (
                <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.4)"
                  fontSize="2.8" fontFamily="Inter, sans-serif">
                  {lbl2}
                </text>
              )}
              {/* Score pill */}
              {zone !== 'Control-Room' && (
                <text x={cx} y={pos.y + pos.h - 3} textAnchor="middle"
                  fill={color} fontSize="3" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  {score}
                </text>
              )}
            </g>
          )
        })}

        {/* Legend */}
        {[
          { c: '#22c55e', l: 'Safe' },
          { c: '#eab308', l: 'Warn' },
          { c: '#f97316', l: 'High' },
          { c: '#ef4444', l: 'Crit' },
        ].map(({ c, l }, i) => (
          <g key={l} transform={`translate(${2 + i * 24}, 95)`}>
            <rect width="8" height="3" fill={c} rx="0.5" />
            <text x={10} y={2.5} fill="rgba(255,255,255,0.5)" fontSize="2.5" fontFamily="Inter, sans-serif">
              {l}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
