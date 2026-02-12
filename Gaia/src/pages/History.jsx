import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './HealthCheck.css';
import './Exercises.css';
import './History.css';

function toSeries(data) {
  if (!data || data.length === 0) return [];
  const t0 = data[0].t;
  return data.map(d => ({
    time: Math.round((d.t - t0) / 1000),
    heartBeat: d.heartBeat,
    fatigue: d.fatigue,
    tension: d.tension,
    temperature: Number(d.temperature),
    cough: d.cough,
    ambiance: d.ambiance,
  }));
}

const metrics = [
  { key: 'heartBeat', label: 'Heart Beat', unit: 'bpm', color: '#6b5b7a', icon: '❤️' },
  { key: 'tension', label: 'Blood Pressure', unit: 'mmHg', color: '#f59e0b', icon: '🩺' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#ef4444', icon: '🌡️' },
  { key: 'fatigue', label: 'Fatigue', unit: '%', color: '#10b981', icon: '😮‍💨' },
  { key: 'cough', label: 'Cough', unit: '%', color: '#06b6d4', icon: '🤧' },
  { key: 'ambiance', label: 'Ambient Noise', unit: 'dB', color: '#a78bfa', icon: '🔊' },
];

export default function History({ onNavigate, data = [], popups = [] }) {
  const [range, setRange] = useState('day'); // 'day' | 'month' | 'year'
  const series = useMemo(() => toSeries(data), [data]);
  const filtered = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = Date.now();
    const cutoff = range === 'day' ? now - 24*60*60*1000 : range === 'month' ? now - 30*24*60*60*1000 : now - 365*24*60*60*1000;
    const subset = data.filter(d => d.t >= cutoff);
    return toSeries(subset.length ? subset : data);
  }, [data, range]);
  const [selected, setSelected] = useState(metrics[0].key);
  const active = metrics.find(m => m.key === selected) || metrics[0];

  const clearHistory = () => {
    try {
      sessionStorage.removeItem('gaia:dataHistory');
      sessionStorage.removeItem('gaia:popupHistory');
    } catch {}
    // Refresh this page with empty data so the UI updates immediately
    onNavigate('history', { data: [], popups: [] });
  };

  return (
    <div className="health-check fade-in history-page" style={{ padding: 16 }}>
      <div className="history-header-row">
        <div className="history-header-left">
          <button className="back-btn" onClick={() => onNavigate('health')}>← Back</button>
          <h1>History</h1>
        </div>
        <div className="history-range-buttons">
          <button className="back-btn mini" onClick={() => setRange('day')} style={{ opacity: range==='day'?1:0.55 }}>Day</button>
          <button className="back-btn mini" onClick={() => setRange('month')} style={{ opacity: range==='month'?1:0.55 }}>Month</button>
          <button className="back-btn mini" onClick={() => setRange('year')} style={{ opacity: range==='year'?1:0.55 }}>Year</button>
          <button className="back-btn mini danger" onClick={clearHistory} title="Clear all saved data">🗑️</button>
        </div>
      </div>
      <div className="history-layout">
        <aside className="history-left">
          <div className="history-recos-panel">
            <h3>Recommendations</h3>
            {popups && popups.length ? (
              <ul className="reco-list">
                {popups.map((p, i) => (
                  <li key={i} className="reco-item">
                    <span className="reco-time">[{new Date(p.t).toLocaleTimeString()}]</span>
                    {p.message}
                  </li>
                ))}
              </ul>
            ) : <div className="reco-empty">No recommendations yet.</div>}
          </div>
        </aside>
        <section className="history-right">
          <div className="history-metrics-grid">
            {metrics.map(m => (
              <div
                key={m.key}
                className={`metric-tile ${selected === m.key ? 'active' : ''}`}
                onClick={() => setSelected(m.key)}
              >
                <div className="metric-icon">{m.icon}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-unit">{m.unit}</div>
              </div>
            ))}
          </div>
          <div className="history-chart new-layout">
            <div className="chart-header">
              <h3>{active.label} ({active.unit})</h3>
            </div>
            {filtered && filtered.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filtered} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                  <XAxis dataKey="time" tick={{ fill: '#ccc', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#ccc', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background:'#1e1e1e', border:'1px solid #444' }} />
                  <Line type="monotone" dataKey={active.key} stroke={active.color} strokeWidth={2} dot={false} animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">Run Test Data to populate the graph.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

