import { useState } from 'react'

interface EQBand {
  label: string
  freq: string
  value: number
}

export default function StudioMastering() {
  const [eq, setEq] = useState<EQBand[]>([
    { label: 'Bass', freq: 'Bass frequencies (60-250Hz)', value: 60 },
    { label: 'Mid', freq: 'Vocal presence (250Hz-4kHz)', value: 50 },
    { label: 'High', freq: 'Brightness (4kHz-20kHz)', value: 55 },
  ])
  const [reverb, setReverb] = useState(30)
  const [compression, setCompression] = useState(50)
  const [loudness, setLoudness] = useState(70)
  const [autoTune, setAutoTune] = useState(false)
  const [pitchIntensity, setPitchIntensity] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMastered, setIsMastered] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')

  const aiFeedbacks = [
    'Strong low-end presence, consider cutting 200Hz by 2dB to reduce muddiness. Vocals sit well in the mix.',
    'Excellent dynamic range. The compression at 50% adds punch without killing the transients.',
    'Nice brightness on the high end. The reverb tail complements the vocal style perfectly.',
    'Good overall balance. Try boosting 3kHz slightly to add presence to the rap vocals.',
  ]

  const updateEq = (i: number, v: number) => {
    setEq(prev => prev.map((b, idx) => idx === i ? { ...b, value: v } : b))
  }

  const loadPreset = (preset: string) => {
    if (preset === 'Hip-Hop') {
      setEq([{ label: 'Bass', freq: 'Bass frequencies (60-250Hz)', value: 75 },
             { label: 'Mid', freq: 'Vocal presence (250Hz-4kHz)', value: 45 },
             { label: 'High', freq: 'Brightness (4kHz-20kHz)', value: 60 }])
      setReverb(25); setCompression(65); setLoudness(80)
    } else if (preset === 'Trap') {
      setEq([{ label: 'Bass', freq: 'Bass frequencies (60-250Hz)', value: 90 },
             { label: 'Mid', freq: 'Vocal presence (250Hz-4kHz)', value: 40 },
             { label: 'High', freq: 'Brightness (4kHz-20kHz)', value: 70 }])
      setReverb(15); setCompression(80); setLoudness(90)
    } else if (preset === 'Vocal') {
      setEq([{ label: 'Bass', freq: 'Bass frequencies (60-250Hz)', value: 40 },
             { label: 'Mid', freq: 'Vocal presence (250Hz-4kHz)', value: 70 },
             { label: 'High', freq: 'Brightness (4kHz-20kHz)', value: 65 }])
      setReverb(40); setCompression(55); setLoudness(65)
    }
  }

  const master = () => {
    setIsProcessing(true)
    setIsMastered(false)
    setTimeout(() => {
      setIsProcessing(false)
      setIsMastered(true)
      setAiFeedback(aiFeedbacks[Math.floor(Math.random() * aiFeedbacks.length)])
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Studio Mastering</h2>
        <p className="text-gray-400 text-sm mt-1">Professional-grade audio processing with AI-powered analysis</p>
      </div>

      {/* Presets */}
      <div className="rounded-xl p-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400">Quick Presets:</span>
          {['Hip-Hop', 'Trap', 'Vocal'].map(p => (
            <button key={p} onClick={() => loadPreset(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:border-cyan-400"
              style={{ background: '#2a3439', color: '#e8eaed', border: '1px solid #3a464d' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* EQ */}
        <div className="rounded-xl p-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
          <h3 className="font-semibold text-white mb-4">EQ</h3>
          <div className="space-y-4">
            {eq.map((band, i) => (
              <div key={band.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: ['#00f0ff','#ff00e6','#00ff88'][i] }}>{band.label}</span>
                  <span className="text-gray-400">{band.freq}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={band.value}
                    onChange={e => updateEq(i, +e.target.value)}
                    className="flex-1 accent-cyan-400" />
                  <span className="text-xs text-gray-300 w-8 text-right">{band.value - 50 > 0 ? '+' : ''}{band.value - 50}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div className="rounded-xl p-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
          <h3 className="font-semibold text-white mb-4">Effects</h3>
          <div className="space-y-4">
            {[
              { label: 'Reverb', sub: 'Space and ambience', value: reverb, set: setReverb },
              { label: 'Compression', sub: 'Dynamic range control', value: compression, set: setCompression },
              { label: 'Loudness', sub: 'Final output level', value: loudness, set: setLoudness },
            ].map(({ label, sub, value, set }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-white">{label}</span>
                  <span className="text-gray-400">{sub}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={value}
                    onChange={e => set(+e.target.value)}
                    className="flex-1 accent-purple-400" />
                  <span className="text-xs text-gray-300 w-6 text-right">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Tune */}
      <div className="rounded-xl p-5" style={{ background: '#1a2428', border: '1px solid #2a3439' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">Auto-Tune</h3>
            <p className="text-xs text-gray-400 mt-0.5">Auto-tune & pitch correction</p>
          </div>
          <div onClick={() => setAutoTune(!autoTune)}
            className="w-12 h-6 rounded-full transition-colors relative cursor-pointer"
            style={{ background: autoTune ? '#00f0ff' : '#2a3439' }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: autoTune ? '26px' : '4px' }} />
          </div>
        </div>
        {autoTune && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Pitch correction intensity — {pitchIntensity}%
            </label>
            <input type="range" min={0} max={100} value={pitchIntensity}
              onChange={e => setPitchIntensity(+e.target.value)}
              className="w-full accent-cyan-400" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Subtle</span><span>Heavy T-Pain</span>
            </div>
          </div>
        )}
      </div>

      {/* Master Button */}
      <button onClick={master} disabled={isProcessing}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-60 neon-glow-cyan hover:opacity-90"
        style={{ background: '#00f0ff', color: '#000' }}>
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="pulse-glow">⚙</span> Processing with AI...
          </span>
        ) : 'Master Audio'}
      </button>

      {/* Result */}
      {isMastered && (
        <div className="rounded-xl p-5 neon-glow-green" style={{ background: '#0a2418', border: '1px solid #00ff88' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#00ff88' }}>✓</span>
            <span className="font-bold text-white">Mastered Audio Ready</span>
          </div>
          <p className="text-sm text-gray-300 mb-3"><span className="font-medium" style={{ color: '#00ff88' }}>AI Feedback: </span>{aiFeedback}</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#00ff88', color: '#000' }}>
              Export lyrics to .txt/.pdf
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#1a2428', color: '#e8eaed', border: '1px solid #2a3439' }}>
              Save to Cloud Vault
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
