import { useState, useRef } from 'react'

interface Recording {
  id: string
  name: string
  duration: string
  lyrics: string
  timestamp: string
  audioUrl?: string
}

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [sensitivity, setSensitivity] = useState(50)
  const [micLevel, setMicLevel] = useState(70)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const sampleLyrics = [
    "Yeah I'm in the zone, mic check one two",
    "Flow like water, bars are see-through",
    "Every line I drop, hit harder than a freight train",
    "Studio session, feeling the bass in my brain",
    "Lyrics memorized, every word precise",
    "Ghost Listener catching every rhyme device",
  ]

  const startRecording = () => {
    setIsRecording(true)
    setIsListening(true)
    setLyrics('')
    setElapsed(0)
    let lineIdx = 0
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
      if (lineIdx < sampleLyrics.length) {
        setLyrics(prev => prev + (prev ? '\n' : '') + sampleLyrics[lineIdx])
        lineIdx++
      }
    }, 2000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsListening(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const saveRecording = () => {
    if (!lyrics) return
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const secs = (elapsed % 60).toString().padStart(2, '0')
    const rec: Recording = {
      id: Date.now().toString(),
      name: `Recording ${recordings.length + 1}`,
      duration: `${mins}:${secs}`,
      lyrics,
      timestamp: new Date().toLocaleTimeString(),
    }
    setRecordings(prev => [rec, ...prev])
    setLyrics('')
    setElapsed(0)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audio Recorder</h2>
          <p className="text-gray-400 text-sm mt-1">Hears you rap &#8594; records &#8594; saves automatically</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: isRecording ? 'rgba(255,0,85,0.15)' : 'rgba(100,100,100,0.15)', border: '1px solid #ff0055', color: '#ff0055' }}>
          {isRecording ? (
            <><span className="w-2 h-2 rounded-full bg-red-500 pulse-glow" /> RECORDING</>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-gray-500" /> IDLE</>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl p-6 space-y-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Trigger Sensitivity — {sensitivity < 30 ? 'Needs loud voice' : sensitivity < 70 ? 'Medium' : 'Max (any sound)'}
            </label>
            <input type="range" min={0} max={100} value={sensitivity}
              onChange={e => setSensitivity(+e.target.value)}
              className="w-full accent-cyan-400" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Needs loud voice</span><span>Triggers easily</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mic Level — {micLevel}%</label>
            <input type="range" min={0} max={100} value={micLevel}
              onChange={e => setMicLevel(+e.target.value)}
              className="w-full accent-cyan-400" />
          </div>
        </div>

        {/* Waveform */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="waveform-bar w-1.5 rounded-full"
                style={{ height: '100%', background: '#00f0ff', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        )}

        {/* Timer */}
        {isRecording && (
          <div className="text-center text-4xl font-mono font-bold" style={{ color: '#00f0ff' }}>
            {formatElapsed()}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <button onClick={startRecording}
              className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90 neon-glow-cyan"
              style={{ background: '#00f0ff' }}>
              ● Start Recording
            </button>
          ) : (
            <button onClick={stopRecording}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{ background: '#ff0055', color: 'white' }}>
              ■ Stop Recording
            </button>
          )}
          <button onClick={saveRecording} disabled={!lyrics || isRecording}
            className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-40"
            style={{ background: lyrics && !isRecording ? '#00ff88' : '#2a3439', color: lyrics && !isRecording ? '#000' : '#666' }}>
            {saved ? '✓ Saved!' : 'Save'}
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#00f0ff' }}>
            <span className="pulse-glow">◉</span>
            <span>Ghost Listener (always-on detection) active</span>
          </div>
        )}
      </div>

      {/* Live Lyrics */}
      <div className="rounded-xl p-5" style={{ background: '#1a2428', border: '1px solid #2a3439' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-white">Current Session</h3>
          {lyrics && <span className="text-xs text-gray-400">Total Lines: {lyrics.split('\n').length}</span>}
        </div>
        <div className="min-h-32 rounded-lg p-4 font-mono text-sm"
          style={{ background: '#0f1419', border: '1px solid #2a3439', color: '#e8eaed' }}>
          {lyrics ? (
            <pre className="whitespace-pre-wrap">{lyrics}</pre>
          ) : (
            <span className="text-gray-500">
              {isListening ? 'Listening... lyrics will appear here' : 'Start recording to see your lyrics in real-time'}
            </span>
          )}
        </div>
      </div>

      {/* Saved Recordings */}
      <div>
        <h3 className="font-semibold text-white mb-3">Saved Recordings</h3>
        {recordings.length === 0 ? (
          <div className="rounded-xl p-8 text-center text-gray-500" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            No recordings yet. Record something and hit Save.
          </div>
        ) : (
          <div className="space-y-2">
            {recordings.map(rec => (
              <div key={rec.id} className="rounded-lg p-4 flex items-center justify-between transition-colors hover:border-cyan-400/30"
                style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
                <div>
                  <div className="font-medium text-white">{rec.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{rec.duration} · {rec.timestamp} · {rec.lyrics.split('\n').length} lines</div>
                </div>
                {deleteConfirm === rec.id ? (
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => deleteRecording(rec.id)}
                      className="px-3 py-1 rounded text-white" style={{ background: '#ff0055' }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 rounded text-gray-300" style={{ background: '#2a3439' }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(rec.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-sm">✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
