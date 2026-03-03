import { useState, useEffect } from 'react'

// ─── Theme Definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'midnight', label: 'Midnight Flex', preview: ['#0f1419', '#00f0ff', '#ff00e6'],
    bg: '#0f1419', surface: '#1a1f24', border: '#2a3439', accent: '#00f0ff', accent2: '#ff00e6', text: '#e8eaed',
  },
  {
    id: 'gold', label: 'Gold Standard', preview: ['#0d0a00', '#FFD700', '#ff8c00'],
    bg: '#0d0a00', surface: '#1a1500', border: '#3a2a00', accent: '#FFD700', accent2: '#ff8c00', text: '#fff8e0',
  },
  {
    id: 'emerald', label: 'Emerald City', preview: ['#001a0d', '#00ff88', '#00c8ff'],
    bg: '#001a0d', surface: '#001f10', border: '#003020', accent: '#00ff88', accent2: '#00c8ff', text: '#e0fff0',
  },
  {
    id: 'crimson', label: 'Crimson Wave', preview: ['#0f0005', '#ff0055', '#ff6600'],
    bg: '#0f0005', surface: '#1a000a', border: '#3a001a', accent: '#ff0055', accent2: '#ff6600', text: '#ffe0e8',
  },
  {
    id: 'purple', label: 'Purple Reign', preview: ['#0a0014', '#aa44ff', '#ff00e6'],
    bg: '#0a0014', surface: '#130020', border: '#280045', accent: '#aa44ff', accent2: '#ff00e6', text: '#f0e0ff',
  },
  {
    id: 'platinum', label: 'Platinum', preview: ['#0a0c10', '#c0c8d8', '#8899bb'],
    bg: '#0a0c10', surface: '#141820', border: '#2a3040', accent: '#c0c8d8', accent2: '#8899bb', text: '#e8eeff',
  },
]

const EQ_BANDS = [
  { id: 'sub', label: 'Sub Bass', freq: '60 Hz', default: 0 },
  { id: 'bass', label: 'Bass', freq: '120 Hz', default: 0 },
  { id: 'low_mid', label: 'Low Mid', freq: '500 Hz', default: 0 },
  { id: 'mid', label: 'Mid', freq: '1 kHz', default: 0 },
  { id: 'high_mid', label: 'High Mid', freq: '4 kHz', default: 0 },
  { id: 'presence', label: 'Presence', freq: '8 kHz', default: 0 },
  { id: 'air', label: 'Air', freq: '16 kHz', default: 0 },
]

const EQ_PRESETS = {
  'Flat': [0, 0, 0, 0, 0, 0, 0],
  'Hip-Hop': [6, 5, 0, -2, 1, 2, 1],
  'Trap': [8, 4, -1, -3, 2, 3, 2],
  'Vocal Boost': [-2, -1, 1, 4, 5, 4, 2],
  'Bass Head': [10, 8, 2, -2, -1, 0, 0],
  'Clarity': [-1, -1, 0, 2, 5, 6, 4],
  'Radio': [0, 2, 1, 3, 2, 1, -1],
}

const CHOP_PATTERNS = [
  { id: 'none', label: 'None', desc: 'No chop' },
  { id: 'half', label: '1/2 Chop', desc: 'Every half bar' },
  { id: 'quarter', label: '1/4 Chop', desc: 'Every quarter' },
  { id: 'eighth', label: '1/8 Stutter', desc: 'Tight stutter' },
  { id: 'triplet', label: 'Triplet', desc: '3-beat feel' },
  { id: 'syncopated', label: 'Syncopated', desc: 'Off-beat chop' },
]

function VerticalSlider({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent: string }) {
  const pct = ((value + 12) / 24) * 100
  return (
    <div className="relative flex flex-col items-center" style={{ height: 120 }}>
      <input
        type="range" min={-12} max={12} step={0.5} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="appearance-none rounded-full cursor-pointer"
        style={{
          writingMode: 'vertical-lr' as any,
          direction: 'rtl' as any,
          width: 28,
          height: 100,
          background: `linear-gradient(to top, ${accent} ${pct}%, #2a3439 ${pct}%)`,
          outline: 'none',
          WebkitAppearance: 'slider-vertical',
        }}
      />
      <span className="text-xs font-mono mt-1" style={{ color: value === 0 ? '#555' : accent }}>
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  )
}

interface SettingsData {
  displayName: string
  themeId: string
  eqValues: number[]
  playbackSpeed: number
  chopPattern: string
  autoCut: boolean
  autoCutSilence: number
  reverbMix: number
  pitchShift: number
  stereoWidth: number
  vocalIsolation: boolean
}

const DEFAULT_SETTINGS: SettingsData = {
  displayName: '',
  themeId: 'midnight',
  eqValues: EQ_BANDS.map(b => b.default),
  playbackSpeed: 1.0,
  chopPattern: 'none',
  autoCut: false,
  autoCutSilence: 500,
  reverbMix: 0,
  pitchShift: 0,
  stereoWidth: 50,
  vocalIsolation: false,
}

const STORAGE_KEY = 'insta-cord-settings'

export function useSettings() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } as SettingsData : DEFAULT_SETTINGS
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  const theme = THEMES.find(t => t.id === settings.themeId) || THEMES[0]

  const update = (patch: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  const setEQ = (index: number, value: number) => {
    const next = [...settings.eqValues]
    next[index] = value
    update({ eqValues: next })
  }

  const loadEQPreset = (name: keyof typeof EQ_PRESETS) => {
    update({ eqValues: [...EQ_PRESETS[name]] })
  }

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('insta-cord-settings-changed', { detail: settings }))
  }

  useEffect(() => {
    // Auto-save on change after small debounce
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      window.dispatchEvent(new CustomEvent('insta-cord-settings-changed', { detail: settings }))
    }, 600)
    return () => clearTimeout(t)
  }, [settings])

  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'theme', label: 'Themes', icon: '🎨' },
    { id: 'eq', label: 'EQ', icon: '🎛' },
    { id: 'playback', label: 'Playback', icon: '⚡' },
    { id: 'chop', label: 'Chop & Cut', icon: '✂️' },
    { id: 'effects', label: 'Effects', icon: '🎚' },
  ]

  const cardStyle = { background: theme.surface, border: `1px solid ${theme.border}` }
  const accentText = { color: theme.accent }
  const mutedText = { color: '#888' }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm mt-1" style={mutedText}>Customize your studio experience</p>
        </div>
        <button onClick={saveSettings}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: saved ? '#00ff88' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: saved ? '#000' : '#000',
            boxShadow: `0 0 20px ${theme.accent}44`,
          }}>
          {saved ? '✓ Saved' : '💾 Save All'}
        </button>
      </div>

      {/* Section Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95"
            style={{
              background: activeSection === s.id ? `linear-gradient(135deg, ${theme.accent}33, ${theme.accent2}22)` : theme.surface,
              color: activeSection === s.id ? theme.accent : '#666',
              border: `1px solid ${activeSection === s.id ? theme.accent : theme.border}`,
              boxShadow: activeSection === s.id ? `0 0 12px ${theme.accent}33` : 'none',
            }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ─── PROFILE ───────────────────────────────────────────── */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 space-y-5" style={cardStyle}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#000' }}>
                {settings.displayName ? settings.displayName[0].toUpperCase() : '🎙'}
              </div>
              <div>
                <div className="text-white font-bold text-lg">{settings.displayName || 'Set your artist name'}</div>
                <div className="text-xs" style={mutedText}>Your name shown on recordings & exports</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block" style={accentText}>ARTIST / DISPLAY NAME</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={e => update({ displayName: e.target.value })}
                placeholder="Enter your artist name..."
                maxLength={32}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: '#0f1419',
                  border: `1px solid ${settings.displayName ? theme.accent : theme.border}`,
                  boxShadow: settings.displayName ? `0 0 8px ${theme.accent}22` : 'none',
                }}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={mutedText}>{settings.displayName.length}/32</span>
              </div>
            </div>

            {/* Quick name tags */}
            <div>
              <label className="text-xs font-semibold mb-2 block" style={mutedText}>QUICK TAGS</label>
              <div className="flex flex-wrap gap-2">
                {['Lil ', 'Young ', 'Big ', 'DJ ', 'MC '].map(tag => (
                  <button key={tag} onClick={() => update({ displayName: tag + (settings.displayName.replace(/^(Lil |Young |Big |DJ |MC )/, '')) })}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: theme.border, color: '#aaa' }}>
                    + {tag.trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Studio ID card preview */}
          <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.surface})`, border: `1px solid ${theme.accent}44` }}>
            <div className="text-xs font-semibold mb-3" style={mutedText}>STUDIO ID CARD PREVIEW</div>
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${theme.accent}11, ${theme.accent2}11)`, border: `1px solid ${theme.accent}33` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#000' }}>
                {settings.displayName ? settings.displayName[0].toUpperCase() : 'IC'}
              </div>
              <div>
                <div className="font-bold text-white text-base">{settings.displayName || 'Artist Name'}</div>
                <div className="text-xs mt-0.5" style={{ color: theme.accent }}>INSTA-CORD · {THEMES.find(t => t.id === settings.themeId)?.label}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs font-mono" style={{ color: theme.accent2 }}>BARS NOT LOST</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── THEMES ────────────────────────────────────────────── */}
      {activeSection === 'theme' && (
        <div className="space-y-4">
          <p className="text-sm" style={mutedText}>Choose your vibe. Changes apply instantly across the whole app.</p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => update({ themeId: t.id })}
                className="rounded-2xl p-4 text-left transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${t.bg}, ${t.surface})`,
                  border: `2px solid ${settings.themeId === t.id ? t.accent : t.border}`,
                  boxShadow: settings.themeId === t.id ? `0 0 20px ${t.accent}55` : 'none',
                }}>
                {/* Color swatches */}
                <div className="flex gap-1.5 mb-3">
                  {t.preview.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                  ))}
                  {settings.themeId === t.id && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ background: t.accent, color: '#000' }}>✓</div>
                  )}
                </div>
                <div className="font-bold text-sm text-white">{t.label}</div>
                <div className="text-xs mt-0.5" style={{ color: t.accent }}>{t.accent} · {t.accent2}</div>
              </button>
            ))}
          </div>

          {/* Live preview card */}
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.surface} 100%)`, border: `1px solid ${theme.accent}` }}>
            <div className="text-xs font-semibold mb-3" style={{ color: theme.accent }}>LIVE PREVIEW — {theme.label.toUpperCase()}</div>
            <div className="space-y-2">
              <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, width: '75%' }} />
              <div className="h-2 rounded-full" style={{ background: theme.border, width: '50%' }} />
              <div className="flex gap-2 mt-3">
                <div className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: theme.accent, color: '#000' }}>Primary</div>
                <div className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: theme.accent2, color: '#000' }}>Secondary</div>
                <div className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}>Surface</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EQ ────────────────────────────────────────────────── */}
      {activeSection === 'eq' && (
        <div className="space-y-4">
          {/* Presets */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="text-xs font-semibold mb-3" style={accentText}>EQ PRESETS</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(EQ_PRESETS).map(name => (
                <button key={name}
                  onClick={() => loadEQPreset(name as keyof typeof EQ_PRESETS)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 hover:opacity-90"
                  style={{
                    background: JSON.stringify(settings.eqValues) === JSON.stringify(EQ_PRESETS[name as keyof typeof EQ_PRESETS])
                      ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                      : theme.border,
                    color: JSON.stringify(settings.eqValues) === JSON.stringify(EQ_PRESETS[name as keyof typeof EQ_PRESETS])
                      ? '#000' : '#ccc',
                  }}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* EQ Visualizer bar */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="text-xs font-semibold mb-4" style={accentText}>7-BAND EQUALIZER</div>
            <div className="flex items-end justify-between gap-3 px-2">
              {EQ_BANDS.map((band, i) => (
                <div key={band.id} className="flex flex-col items-center gap-2 flex-1">
                  <VerticalSlider
                    value={settings.eqValues[i]}
                    onChange={v => setEQ(i, v)}
                    accent={theme.accent}
                  />
                  <div className="text-center">
                    <div className="text-xs font-bold text-white leading-tight">{band.label.split(' ').map((w, j) => <div key={j}>{w}</div>)}</div>
                    <div className="text-xs mt-0.5" style={{ color: theme.accent2, fontSize: 9 }}>{band.freq}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* EQ curve visualization */}
            <div className="mt-4 rounded-xl overflow-hidden" style={{ height: 60, background: '#0f1419', border: `1px solid ${theme.border}` }}>
              <svg viewBox="0 0 300 60" preserveAspectRatio="none" width="100%" height="100%">
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.accent} />
                    <stop offset="100%" stopColor={theme.accent2} />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[15, 30, 45].map(y => (
                  <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={theme.border} strokeWidth="0.5" />
                ))}
                <line x1="0" y1="30" x2="300" y2="30" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
                {/* EQ curve */}
                <polyline
                  fill="none"
                  stroke="url(#eqGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={settings.eqValues.map((v, i) => {
                    const x = (i / (EQ_BANDS.length - 1)) * 300
                    const y = 30 - (v / 12) * 25
                    return `${x},${y}`
                  }).join(' ')}
                />
                {/* Dots */}
                {settings.eqValues.map((v, i) => {
                  const x = (i / (EQ_BANDS.length - 1)) * 300
                  const y = 30 - (v / 12) * 25
                  return <circle key={i} cx={x} cy={y} r="3" fill={theme.accent} />
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ─── PLAYBACK ──────────────────────────────────────────── */}
      {activeSection === 'playback' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>

            {/* Playback Speed */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white">Playback Speed</label>
                <div className="px-3 py-1 rounded-lg text-sm font-mono font-bold"
                  style={{ background: `${theme.accent}22`, color: theme.accent, border: `1px solid ${theme.accent}44` }}>
                  {settings.playbackSpeed.toFixed(2)}x
                </div>
              </div>
              <input type="range" min={0.25} max={2.0} step={0.05} value={settings.playbackSpeed}
                onChange={e => update({ playbackSpeed: parseFloat(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.accent }}
              />
              <div className="flex justify-between text-xs mt-1" style={mutedText}>
                <span>0.25x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
              {/* Speed presets */}
              <div className="flex gap-2 mt-3">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                  <button key={s} onClick={() => update({ playbackSpeed: s })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: settings.playbackSpeed === s ? theme.accent : theme.border,
                      color: settings.playbackSpeed === s ? '#000' : '#999',
                    }}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Shift */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white">Pitch Shift</label>
                <div className="px-3 py-1 rounded-lg text-sm font-mono font-bold"
                  style={{ background: `${theme.accent2}22`, color: theme.accent2, border: `1px solid ${theme.accent2}44` }}>
                  {settings.pitchShift > 0 ? `+${settings.pitchShift}` : settings.pitchShift} st
                </div>
              </div>
              <input type="range" min={-12} max={12} step={1} value={settings.pitchShift}
                onChange={e => update({ pitchShift: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.accent2 }}
              />
              <div className="flex justify-between text-xs mt-1" style={mutedText}>
                <span>-12 (Lower)</span>
                <span>0 (Original)</span>
                <span>+12 (Higher)</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[-12, -6, -3, 0, 3, 6, 12].map(v => (
                  <button key={v} onClick={() => update({ pitchShift: v })}
                    className="flex-1 py-1 rounded text-xs font-bold transition-all"
                    style={{
                      background: settings.pitchShift === v ? theme.accent2 : theme.border,
                      color: settings.pitchShift === v ? '#000' : '#888',
                    }}>
                    {v > 0 ? `+${v}` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Stereo Width */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white">Stereo Width</label>
                <span className="text-sm font-mono" style={accentText}>{settings.stereoWidth}%</span>
              </div>
              <input type="range" min={0} max={200} step={5} value={settings.stereoWidth}
                onChange={e => update({ stereoWidth: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.accent }}
              />
              <div className="flex justify-between text-xs mt-1" style={mutedText}>
                <span>Mono</span><span>Normal</span><span>Wide</span>
              </div>
            </div>

            {/* Vocal Isolation toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#0f1419', border: `1px solid ${theme.border}` }}>
              <div>
                <div className="font-bold text-white text-sm">Vocal Isolation Mode</div>
                <div className="text-xs mt-0.5" style={mutedText}>Filters out background noise, focuses on your voice</div>
              </div>
              <button onClick={() => update({ vocalIsolation: !settings.vocalIsolation })}
                className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ background: settings.vocalIsolation ? theme.accent : theme.border }}>
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{ left: settings.vocalIsolation ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHOP & CUT ────────────────────────────────────────── */}
      {activeSection === 'chop' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>

            {/* Chop Pattern */}
            <div>
              <label className="text-xs font-semibold mb-3 block" style={accentText}>CHOP PATTERN</label>
              <div className="grid grid-cols-2 gap-2">
                {CHOP_PATTERNS.map(p => (
                  <button key={p.id} onClick={() => update({ chopPattern: p.id })}
                    className="p-3 rounded-xl text-left transition-all active:scale-95"
                    style={{
                      background: settings.chopPattern === p.id ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent2}11)` : '#0f1419',
                      border: `1px solid ${settings.chopPattern === p.id ? theme.accent : theme.border}`,
                      boxShadow: settings.chopPattern === p.id ? `0 0 10px ${theme.accent}33` : 'none',
                    }}>
                    <div className="font-bold text-sm text-white">{p.label}</div>
                    <div className="text-xs mt-0.5" style={mutedText}>{p.desc}</div>
                    {settings.chopPattern === p.id && (
                      <div className="text-xs mt-1 font-bold" style={accentText}>✓ Active</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Cut on Silence */}
            <div className="p-4 rounded-xl space-y-4" style={{ background: '#0f1419', border: `1px solid ${theme.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Auto-Cut Silence</div>
                  <div className="text-xs mt-0.5" style={mutedText}>Automatically remove silent gaps from recordings</div>
                </div>
                <button onClick={() => update({ autoCut: !settings.autoCut })}
                  className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: settings.autoCut ? theme.accent : theme.border }}>
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: settings.autoCut ? '26px' : '2px' }} />
                </button>
              </div>

              {settings.autoCut && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-white">Silence Threshold</label>
                    <span className="text-xs font-mono" style={accentText}>{settings.autoCutSilence}ms</span>
                  </div>
                  <input type="range" min={100} max={2000} step={100} value={settings.autoCutSilence}
                    onChange={e => update({ autoCutSilence: parseInt(e.target.value) })}
                    className="w-full"
                    style={{ accentColor: theme.accent }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={mutedText}>
                    <span>100ms (Tight)</span><span>2000ms (Loose)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Visual chop pattern display */}
            {settings.chopPattern !== 'none' && (
              <div className="rounded-xl p-4" style={{ background: '#0f1419', border: `1px solid ${theme.accent}33` }}>
                <div className="text-xs font-semibold mb-2" style={accentText}>PATTERN PREVIEW</div>
                <div className="flex gap-1">
                  {Array(16).fill(0).map((_, i) => {
                    const active = settings.chopPattern === 'half' ? i % 8 === 0
                      : settings.chopPattern === 'quarter' ? i % 4 === 0
                      : settings.chopPattern === 'eighth' ? i % 2 === 0
                      : settings.chopPattern === 'triplet' ? i % 3 === 0
                      : settings.chopPattern === 'syncopated' ? [1, 3, 6, 9, 11, 14].includes(i)
                      : false
                    return (
                      <div key={i} className="flex-1 h-6 rounded-sm"
                        style={{
                          background: active ? `linear-gradient(to top, ${theme.accent}, ${theme.accent2})` : theme.border,
                          boxShadow: active ? `0 0 4px ${theme.accent}` : 'none',
                        }} />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── EFFECTS ───────────────────────────────────────────── */}
      {activeSection === 'effects' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>

            {/* Reverb Mix */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white">🌊 Reverb Mix</label>
                <span className="text-sm font-mono" style={accentText}>{settings.reverbMix}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={settings.reverbMix}
                onChange={e => update({ reverbMix: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.accent }}
              />
              <div className="flex justify-between text-xs mt-1" style={mutedText}>
                <span>Dry</span><span>Room</span><span>Hall</span><span>Cathedral</span>
              </div>
            </div>

            {/* Effects summary card */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#0f1419', border: `1px solid ${theme.border}` }}>
              <div className="text-xs font-semibold" style={accentText}>ACTIVE SETTINGS SUMMARY</div>
              {[
                { label: 'EQ', value: `${settings.eqValues.filter(v => v !== 0).length} bands active` },
                { label: 'Speed', value: `${settings.playbackSpeed}x` },
                { label: 'Pitch', value: settings.pitchShift === 0 ? 'Original' : `${settings.pitchShift > 0 ? '+' : ''}${settings.pitchShift} semitones` },
                { label: 'Stereo', value: `${settings.stereoWidth}% width` },
                { label: 'Reverb', value: settings.reverbMix === 0 ? 'Off' : `${settings.reverbMix}%` },
                { label: 'Chop', value: CHOP_PATTERNS.find(p => p.id === settings.chopPattern)?.label || 'None' },
                { label: 'Auto-Cut', value: settings.autoCut ? `${settings.autoCutSilence}ms threshold` : 'Off' },
                { label: 'Vocal ISO', value: settings.vocalIsolation ? 'On' : 'Off' },
                { label: 'Theme', value: THEMES.find(t => t.id === settings.themeId)?.label || '' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs" style={mutedText}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: theme.text }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Reset button */}
            <button
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ background: 'rgba(255,0,85,0.1)', color: '#ff4466', border: '1px solid rgba(255,0,85,0.3)' }}>
              ↺ Reset All to Default
            </button>
          </div>
        </div>
      )}

      {/* Auto-save notice */}
      <div className="flex items-center gap-2 text-xs" style={mutedText}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        Settings save automatically as you change them
      </div>
    </div>
  )
}
