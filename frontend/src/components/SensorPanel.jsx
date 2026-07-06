import { useSafety } from '../context/SafetyContext'

const SENSOR_CONFIG = [
  { key: 'gas_ch4',  label: 'CH₄ Methane',   unit: 'ppm', icon: '💨', warn: 25, crit: 40 },
  { key: 'gas_co',   label: 'CO',             unit: 'ppm', icon: '☁️', warn: 50, crit: 100 },
  { key: 'gas_h2s',  label: 'H₂S',           unit: 'ppm', icon: '☠️', warn: 10, crit: 20 },
  { key: 'temp',     label: 'Temperature',    unit: '°C',  icon: '🌡️', warn: 70, crit: 85 },
  { key: 'humidity', label: 'Humidity',       unit: '%',   icon: '💧', warn: 80, crit: 90 },
]

function getSeverity(val, warn, crit) {
  if (val >= crit) return 'critical'
  if (val >= warn) return 'high'
  if (val >= warn * 0.7) return 'warning'
  return 'safe'
}

function SensorCard({ config, zones }) {
  const readings = Object.entries(zones)
    .map(([zone, sensors]) => ({ zone, value: sensors[config.key] }))
    .filter(r => r.value != null)

  const maxVal  = readings.length ? Math.max(...readings.map(r => r.value)) : 0
  const sev     = getSeverity(maxVal, config.warn, config.crit)
  const pct     = Math.min(100, (maxVal / (config.crit * 1.2)) * 100)

  return (
    <div className={`card card-${sev}`} style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{config.icon}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {config.label}
          </div>
        </div>
        <span className={`badge badge-${sev}`} style={{ fontSize: '0.65rem' }}>
          {sev.toUpperCase()}
        </span>
      </div>

      {/* Max value */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800,
        color: sev === 'critical' ? 'var(--crit)' : sev === 'high' ? 'var(--high)' : sev === 'warning' ? 'var(--warn)' : 'var(--safe)',
        lineHeight: 1,
      }}>
        {maxVal.toFixed(1)}
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
          {config.unit}
        </span>
      </div>

      {/* Bar */}
      <div style={{ height: 3, background: 'var(--bg-hover)', borderRadius: 2, margin: '0.5rem 0', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width:  `${pct}%`,
          background: `linear-gradient(90deg, var(--safe), var(--${sev === 'safe' ? 'safe' : sev === 'warning' ? 'warn' : sev === 'high' ? 'high' : 'crit'}))`,
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Limit */}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        Limit: {config.warn} | Crit: {config.crit} {config.unit}
      </div>

      {/* Zone readings */}
      {readings.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {readings.map(({ zone, value }) => (
            <span key={zone} style={{
              fontSize: '0.65rem', padding: '0.15rem 0.4rem',
              background: 'var(--bg-hover)', borderRadius: 4,
              color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
            }}>
              {zone.replace('Zone-', 'Z')}: {value?.toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SensorPanel() {
  const { state } = useSafety()

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔬 Live Sensor Readings</span>
        <span className={`badge badge-info`}>Real-time</span>
      </div>
      <div className="grid-auto">
        {SENSOR_CONFIG.map(cfg => (
          <SensorCard key={cfg.key} config={cfg} zones={state.sensors} />
        ))}
      </div>
    </div>
  )
}
