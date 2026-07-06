import { useSafety } from '../context/SafetyContext'

export default function EquipmentPanel() {
  const { state } = useSafety()
  const { equipment } = state
  const eqList = Object.values(equipment)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <span className="card-title">⚙️ Equipment Monitor</span>
        <span className="badge badge-info">{eqList.length} total</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
        {eqList.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No equipment telemetry detected.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Temp</th>
                  <th>Vibration</th>
                  <th>Zone</th>
                </tr>
              </thead>
              <tbody>
                {eqList.map(eq => {
                  const isFault = eq.status === 'fault'
                  const isOff = eq.status === 'offline'
                  const statusColor = isFault ? 'var(--crit)' : isOff ? 'var(--text-muted)' : 'var(--safe)'

                  return (
                    <tr key={eq.equipment_id}>
                      <td style={{ fontWeight: 600 }}>
                        <div>{eq.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{eq.equipment_id}</div>
                      </td>
                      <td>
                        <span style={{ color: statusColor, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          ● {eq.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {eq.temperature != null ? `${eq.temperature.toFixed(1)}°C` : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {eq.vibration != null ? `${eq.vibration.toFixed(2)} mm/s` : '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{eq.zone}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
