import { useState, useRef, useEffect } from 'react'

export default function Teleprompter() {
  const [text, setText] = useState(`Yeah I'm in the zone, mic check one two
Flow like water, bars are see-through
Every line I drop, hit harder than a freight train
Studio session, feeling the bass in my brain
Lyrics memorized, every word precise
Ghost Listener catching every rhyme device
Keep it moving, never stop the grind
Each verse a masterpiece from the sharpest mind`)
  const [isScrolling, setIsScrolling] = useState(false)
  const [speed, setSpeed] = useState(3)
  const [fontSize, setFontSize] = useState(28)
  const [highlight, setHighlight] = useState(0)
  const [blurMode, setBlurMode] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lines = text.split('\n').filter(l => l.trim())

  useEffect(() => {
    if (isScrolling) {
      intervalRef.current = setInterval(() => {
        setHighlight(h => {
          if (h >= lines.length - 1) {
            setIsScrolling(false)
            return h
          }
          return h + 1
        })
      }, Math.max(500, 4000 - speed * 400))
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isScrolling, speed, lines.length])

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-line="${highlight}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlight])

  const reset = () => {
    setIsScrolling(false)
    setHighlight(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Teleprompter</h2>
        <p className="text-gray-400 text-sm mt-1">Teleprompter display for hands-free lyric reading</p>
      </div>

      {/* Controls */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Scroll Speed — {speed}/10</label>
            <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(+e.target.value)}
              className="w-full accent-cyan-400" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Font Size — {fontSize}px</label>
            <input type="range" min={16} max={56} value={fontSize} onChange={e => setFontSize(+e.target.value)}
              className="w-full accent-cyan-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setBlurMode(!blurMode)}
              className="w-10 h-5 rounded-full transition-colors relative"
              style={{ background: blurMode ? '#00f0ff' : '#2a3439' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: blurMode ? '22px' : '2px' }} />
            </div>
            <span className="text-sm text-gray-300">Blur mode (hide upcoming lines)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setIsScrolling(!isScrolling)}
            className="flex-1 py-2.5 rounded-lg font-bold transition-all"
            style={{ background: isScrolling ? '#ff0055' : '#00f0ff', color: isScrolling ? 'white' : 'black' }}>
            {isScrolling ? '⏸ Pause' : '▶ Start'}
          </button>
          <button onClick={reset}
            className="px-5 py-2.5 rounded-lg font-semibold text-gray-300 transition-all hover:text-white"
            style={{ background: '#2a3439' }}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Display */}
      <div ref={scrollRef} className="rounded-xl p-6 overflow-y-auto"
        style={{ background: '#000', border: '1px solid #2a3439', height: '320px' }}>
        {lines.map((line, i) => (
          <div key={i} data-line={i}
            className="py-2 transition-all duration-500"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.4,
              color: i === highlight ? '#00f0ff' : i < highlight ? '#3a464d' : '#e8eaed',
              fontWeight: i === highlight ? 700 : 400,
              filter: blurMode && i > highlight + 1 ? 'blur(6px)' : 'none',
              textShadow: i === highlight ? '0 0 20px rgba(0,240,255,0.5)' : 'none',
              transform: i === highlight ? 'scale(1.02)' : 'scale(1)',
              transformOrigin: 'left',
            }}>
            {i === highlight && <span className="mr-3" style={{ color: '#00f0ff' }}>▶</span>}
            {line}
          </div>
        ))}
      </div>

      {/* Lyrics Editor */}
      <div>
        <h3 className="font-semibold text-white mb-2">Edit Lyrics</h3>
        <textarea value={text} onChange={e => { setText(e.target.value); reset() }}
          rows={6}
          className="w-full rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-cyan-400"
          style={{ background: '#1a1f24', border: '1px solid #2a3439', color: '#e8eaed' }}
          placeholder="Paste your lyrics here..." />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{lines.length} lines</span>
          <span>Line {highlight + 1} of {lines.length}</span>
        </div>
      </div>
    </div>
  )
}
