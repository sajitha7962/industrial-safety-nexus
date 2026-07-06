import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { useSafety } from '../context/SafetyContext'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
)

export default function HistoricalTrends() {
  const { state } = useSafety()
  const [history, setHistory] = useState([])

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch initial history from DB on load
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API}/api/sensors/history?zone=Zone-D&hours=24`)
        const data = await res.json()
        if (data.history && data.history.length > 0) {
          const groups = {}
          data.history.forEach(r => {
            const timeStr = new Date(r.timestamp).toLocaleTimeString()
            if (!groups[timeStr]) {
              groups[timeStr] = { time: timeStr, ch4: 0, co: 0, h2s: 0 }
            }
            if (r.sensor_type === 'gas_ch4') groups[timeStr].ch4 = r.value
            if (r.sensor_type === 'gas_co') groups[timeStr].co = r.value
            if (r.sensor_type === 'gas_h2s') groups[timeStr].h2s = r.value
          })
          const sorted = Object.values(groups).slice(-30)
          setHistory(sorted)
        }
      } catch (e) {
        console.warn('Failed to load sensor history:', e)
      }
    }
    loadHistory()
  }, [])

  // Keep a local window of the last 15 gas readings for the live trend chart
  useEffect(() => {
    const ch4 = state.sensors['Zone-D']?.gas_ch4 || 0
    const co = state.sensors['Zone-D']?.gas_co || 0
    const h2s = state.sensors['Zone-D']?.gas_h2s || 0

    if (ch4 === 0 && co === 0 && h2s === 0) return

    setHistory(prev => {
      // Avoid duplicate timestamps if they come in quick succession
      const timeStr = new Date().toLocaleTimeString()
      if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
        const next = [...prev]
        next[next.length - 1] = { time: timeStr, ch4, co, h2s }
        return next
      }
      const next = [...prev, {
        time: timeStr,
        ch4, co, h2s
      }]
      if (next.length > 30) next.shift()
      return next
    })
  }, [state.sensors])

  const chartData = {
    labels: history.map(h => h.time),
    datasets: [
      {
        label: 'Methane (CH4)',
        data: history.map(h => h.ch4),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3
      },
      {
        label: 'Carbon Monoxide (CO)',
        data: history.map(h => h.co),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        tension: 0.3
      },
      {
        label: 'Hydrogen Sulphide (H2S)',
        data: history.map(h => h.h2s),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#8ba4c4' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8ba4c4' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8ba4c4' } }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header">
        <span className="card-title">📈 Live Gas Sensor Trend Analysis (Zone-D)</span>
      </div>

      <div className="card">
        {history.length < 2 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            Waiting for enough sensor telemetry readings to plot trend line...
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  )
}
