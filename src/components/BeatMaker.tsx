import { useState } from 'react'

const TRACKS = ['Kick', 'Snare', 'Hi-Hat', 'Cymbal']
const STEPS = 16
const PRESETS = {
  'Hip-Hop': [
    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0],
  ],
  'Trap': [
    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    [0,0,0,1, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  ],
}

const TRACK_COLORS = ['#00f0ff', '#ff00e6', '#00ff88', '#ffd700']

export default function BeatMaker() {
  const [pattern, setPattern] = useState<number[][]>(
    Array(TRACKS.length).fill(null).map(() => Array(STEPS).fill(0))
  )
  const [bpm, setBpm] = useState(90)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const intervalRef = { current: null as ReturnType<typeof setInterval> | null }

  const toggleStep = (track: number, step: number) => {
    setPattern(prev => {
      const next = prev.map(r => [...r])
      next[track][step] = next[track][step] ? 0 : 1
      return next
    })
  }

  const loadPreset = (name: keyof typeof PRESETS) => {
    setPattern(PRESETS[name].map(r => [...r]))
  }

  const clearAll = () => {
    setPattern(Array(TRACKS.length).fill(null).map(() => Array(STEPS).fill(0)))
    setCurrentStep(-1)
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setCurrentStep(-1)
      if (intervalRef.current) clearInterval(intervalRef.current)
    } else {
      setIsPlaying(true)
      let step = 0
      intervalRef.current = setInterval(() => {
        setCurrentStep(step)
        step = (step + 1) % STEPS
      }, (60 / bpm / 4) * 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Beat Maker</h2>
        <p className="text-gray-400 text-sm mt-1">Sample library (100+ sounds) · Multi-track sequencer</p>
      </div>

      {/* Controls */}
      <div className="rounded-xl p-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">BPM</label>
            <input type="range" min={60} max={200} value={bpm}
              onChange={e => { setBpm(+e.target.value); if (isPlaying) { togglePlay(); setTimeout(togglePlay, 50) } }}
              className="w-32 accent-cyan-400" />
            <span className="text-white font-bold w-8">{bpm}</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <span className="text-xs text-gray-400 self-center">Quick Presets:</span>
            {Object.keys(PRESETS).map(p => (
              <button key={p} onClick={() => loadPreset(p as keyof typeof PRESETS)}
                className="px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-80"
                style={{ background: '#2a3439', color: '#e8eaed', border: '1px solid #3a464d' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={togglePlay}
            className="px-8 py-2.5 rounded-lg font-bold transition-all"
            style={{ background: isPlaying ? '#ff0055' : '#00f0ff', color: isPlaying ? 'white' : 'black' }}>
            {isPlaying ? '⏹ Stop' : '▶ Play'}
          </button>
          <button onClick={clearAll}
            className="px-5 py-2.5 rounded-lg font-semibold text-gray-300 transition-all hover:text-white"
            style={{ background: '#2a3439' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="rounded-xl p-5 overflow-x-auto" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        <div className="min-w-max">
          {/* Step numbers */}
          <div className="flex mb-2 ml-20">
            {Array(STEPS).fill(null).map((_, i) => (
              <div key={i} className="w-8 text-center text-xs"
                style={{ color: currentStep === i ? '#00f0ff' : '#3a464d', fontWeight: currentStep === i ? 700 : 400 }}>
                {i + 1}
              </div>
            ))}
          </div>

          {TRACKS.map((track, ti) => (
            <div key={track} className="flex items-center mb-2">
              <div className="w-20 text-sm font-medium pr-3 text-right"
                style={{ color: TRACK_COLORS[ti] }}>
                {track}
              </div>
              {Array(STEPS).fill(null).map((_, si) => (
                <button key={si} onClick={() => toggleStep(ti, si)}
                  className="w-8 h-8 rounded-sm mx-0.5 transition-all hover:opacity-90"
                  style={{
                    background: pattern[ti][si]
                      ? TRACK_COLORS[ti]
                      : currentStep === si ? '#2a3439' : '#1a2428',
                    border: `1px solid ${currentStep === si ? TRACK_COLORS[ti] + '40' : '#2a3439'}`,
                    boxShadow: pattern[ti][si] && currentStep === si
                      ? `0 0 8px ${TRACK_COLORS[ti]}` : 'none',
                    transform: pattern[ti][si] && currentStep === si ? 'scale(1.1)' : 'scale(1)',
                  }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
