import { useState, useRef, useEffect, useCallback } from 'react'

interface Recording {
  id: string
  name: string
  duration: string
  lyrics: string
  timestamp: string
  audioUrl?: string
}

interface Props {
  onRecordingSaved?: (rec: { id: string; name: string; lyrics: string; duration: string }) => void
  onGenerateBeat?: (rec: { id: string; name: string; lyrics: string; duration: string }) => void
}

export default function AudioRecorder({ onRecordingSaved, onGenerateBeat }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [waitingForVoice, setWaitingForVoice] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [sensitivity, setSensitivity] = useState(60)
  const [micLevel, setMicLevel] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [micError, setMicError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isRecordingRef = useRef(false)
  const lyricsRef = useRef('')
  const elapsedRef = useRef(0)

  useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])
  useEffect(() => { lyricsRef.current = lyrics }, [lyrics])
  useEffect(() => { elapsedRef.current = elapsed }, [elapsed])

  useEffect(() => {
    return () => { fullStop() }
  }, [])

  const fullStop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (recognitionRef.current) { try { recognitionRef.current.abort() } catch {} }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
      audioContextRef.current = null
    }
  }

  const getRmsLevel = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const d = data[i] - 128
      sum += d * d
    }
    return Math.sqrt(sum / data.length)
  }

  const startSpeechRecognition = (_stream: MediaStream) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + '\n'
        else interim += t
      }
      if (final) setLyrics(prev => prev + final)
      setTranscript(interim)
    }
    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech error:', e.error)
      }
    }
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start() } catch {}
      }
    }
    try { recognition.start() } catch {}
  }

  // Core function: open mic stream, watch for voice, then flip into recording
  const beginAutoListen = useCallback(async () => {
    setMicError('')
    setWaitingForVoice(true)
    setStatusMsg('Listening for your voice...')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyserRef.current = analyser

      // threshold: sensitivity 0→high threshold (needs loud voice), 100→low threshold (triggers easily)
      const threshold = 2 + (100 - sensitivity) * 0.22

      let triggered = false
      const poll = () => {
        const level = getRmsLevel(analyser)
        setMicLevel(Math.round(level * 3))

        if (!triggered && level > threshold) {
          triggered = true
          setWaitingForVoice(false)
          setStatusMsg('Voice detected — recording!')
          setTimeout(() => setStatusMsg(''), 2500)
          beginRecording(stream, audioCtx, analyser)
          return
        }
        animFrameRef.current = requestAnimationFrame(poll)
      }
      poll()
    } catch (err: any) {
      setWaitingForVoice(false)
      setAutoMode(false)
      setMicError('Microphone access denied. Tap Allow when the browser asks.')
    }
  }, [sensitivity])

  // Takes over the already-open stream and starts MediaRecorder + timer + speech
  const beginRecording = (stream: MediaStream, _audioCtx: AudioContext, analyser: AnalyserNode) => {
    audioChunksRef.current = []
    setLyrics('')
    setTranscript('')
    setElapsed(0)

    // Keep animating mic level
    const animateMic = () => {
      setMicLevel(Math.round(getRmsLevel(analyser) * 3))
      animFrameRef.current = requestAnimationFrame(animateMic)
    }
    animateMic()

    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }
    mediaRecorder.start(100)

    setIsRecording(true)

    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)

    startSpeechRecognition(stream)
  }

  const startManualRecording = async () => {
    setMicError('')
    setAutoMode(false)
    setWaitingForVoice(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyserRef.current = analyser

      beginRecording(stream, audioCtx, analyser)
    } catch {
      setMicError('Microphone access denied. Please allow mic access and try again.')
    }
  }

  const stopRecording = () => {
    fullStop()
    setIsRecording(false)
    setAutoMode(false)
    setWaitingForVoice(false)
    setMicLevel(0)
    setTranscript('')
  }

  const toggleAutoMode = () => {
    if (autoMode || waitingForVoice) {
      fullStop()
      setAutoMode(false)
      setWaitingForVoice(false)
      setIsRecording(false)
      setMicLevel(0)
    } else {
      setAutoMode(true)
      beginAutoListen()
    }
  }

  const saveRecording = () => {
    const currentLyrics = lyricsRef.current
    if (!currentLyrics.trim()) return

    const e = elapsedRef.current
    const mins = Math.floor(e / 60).toString().padStart(2, '0')
    const secs = (e % 60).toString().padStart(2, '0')

    let audioUrl: string | undefined
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioUrl = URL.createObjectURL(blob)
    }

    const rec: Recording = {
      id: Date.now().toString(),
      name: `Recording ${recordings.length + 1}`,
      duration: `${mins}:${secs}`,
      lyrics: currentLyrics.trim(),
      timestamp: new Date().toLocaleTimeString(),
      audioUrl,
    }
    setRecordings(prev => [rec, ...prev])
    setLyrics('')
    setElapsed(0)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (onRecordingSaved) onRecordingSaved({ id: rec.id, name: rec.name, lyrics: rec.lyrics, duration: rec.duration })
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const isActive = isRecording || waitingForVoice

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audio Recorder</h2>
          <p className="text-gray-400 text-sm mt-1">Auto starts when you rap · Speech-to-text lyrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: isRecording ? 'rgba(255,0,85,0.15)' : waitingForVoice ? 'rgba(0,240,255,0.15)' : 'rgba(60,60,60,0.3)',
            border: `1px solid ${isRecording ? '#ff0055' : waitingForVoice ? '#00f0ff' : '#444'}`,
            color: isRecording ? '#ff0055' : waitingForVoice ? '#00f0ff' : '#888'
          }}>
          <span className="w-2 h-2 rounded-full"
            style={{ background: isRecording ? '#ff0055' : waitingForVoice ? '#00f0ff' : '#555',
              animation: isActive ? 'pulse 1s infinite' : 'none' }} />
          {isRecording ? 'RECORDING' : waitingForVoice ? 'LISTENING' : 'IDLE'}
        </div>
      </div>

      {/* Error */}
      {micError && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(255,0,85,0.1)', border: '1px solid #ff0055', color: '#ff0055' }}>
          {micError}
        </div>
      )}

      {/* Status flash */}
      {statusMsg && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid #00f0ff', color: '#00f0ff' }}>
          🎤 {statusMsg}
        </div>
      )}

      {/* Main Controls */}
      <div className="rounded-xl p-6 space-y-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>

        {/* Sensitivity slider — only show when not recording */}
        {!isRecording && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Auto-Detect Sensitivity — {sensitivity < 30 ? 'Loud voice needed' : sensitivity < 70 ? 'Normal' : 'Very sensitive (triggers easily)'}
            </label>
            <input type="range" min={0} max={100} value={sensitivity}
              onChange={e => setSensitivity(+e.target.value)}
              className="w-full accent-cyan-400" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Quieter threshold</span><span>Louder threshold</span>
            </div>
          </div>
        )}

        {/* Mic level bar */}
        {isActive && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              {waitingForVoice ? 'Waiting for voice...' : 'Mic Level'}
            </label>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#2a3439' }}>
              <div className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.min(100, micLevel * 2)}%`,
                  background: isRecording ? 'linear-gradient(90deg, #00f0ff, #ff00e6)' : '#00f0ff'
                }} />
            </div>
          </div>
        )}

        {/* Waveform */}
        {isRecording && (
          <div className="flex items-center justify-center gap-0.5 h-10">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-1 rounded-full"
                style={{
                  height: `${Math.max(15, Math.min(100, micLevel * 2 * (0.5 + Math.random())))}%`,
                  background: `hsl(${180 + i * 5}, 100%, 60%)`,
                  transition: 'height 0.08s',
                }} />
            ))}
          </div>
        )}

        {/* Timer */}
        {isRecording && (
          <div className="text-center text-4xl font-mono font-bold" style={{ color: '#00f0ff' }}>
            {formatTime(elapsed)}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <>
              <button onClick={startManualRecording}
                className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00f0ff, #00c8d4)' }}>
                ● Record Now
              </button>
              <button onClick={toggleAutoMode}
                className="flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-95"
                style={{
                  background: (autoMode || waitingForVoice) ? 'rgba(0,240,255,0.2)' : '#2a3439',
                  color: (autoMode || waitingForVoice) ? '#00f0ff' : '#aaa',
                  border: (autoMode || waitingForVoice) ? '1px solid #00f0ff' : '1px solid #3a464d'
                }}>
                {waitingForVoice ? '👂 Listening...' : autoMode ? '👂 Auto ON' : '👂 Auto-Detect'}
              </button>
            </>
          ) : (
            <>
              <button onClick={stopRecording}
                className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#ff0055', color: 'white' }}>
                ■ Stop
              </button>
              <button onClick={() => { stopRecording(); setTimeout(saveRecording, 100) }}
                disabled={!lyrics.trim()}
                className="flex-1 py-3 rounded-lg font-bold transition-all disabled:opacity-40 active:scale-95"
                style={{ background: lyrics.trim() ? '#00ff88' : '#2a3439', color: lyrics.trim() ? '#000' : '#666' }}>
                ■ Stop & Save
              </button>
            </>
          )}
        </div>

        {/* Save button when stopped */}
        {!isRecording && lyrics.trim() && (
          <button onClick={saveRecording}
            className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#00ff88', color: '#000' }}>
            {saved ? '✓ Saved!' : '💾 Save Recording'}
          </button>
        )}

        {(autoMode || waitingForVoice) && !isRecording && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#00f0ff' }}>
            <span style={{ animation: 'pulse 1.2s infinite' }}>◉</span>
            <span>Ghost Listener active — start rapping and it will record automatically</span>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {(isRecording || lyrics) && (
        <div className="rounded-xl p-5" style={{ background: '#1a2428', border: '1px solid #2a3439' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">Live Transcript</h3>
            {lyrics && <span className="text-xs text-gray-400">{lyrics.trim().split('\n').filter(Boolean).length} lines</span>}
          </div>
          <div className="min-h-24 rounded-lg p-4 font-mono text-sm"
            style={{ background: '#0f1419', border: '1px solid #2a3439', color: '#e8eaed' }}>
            {lyrics ? (
              <pre className="whitespace-pre-wrap">{lyrics}
                {transcript && <span style={{ color: '#666' }}>{transcript}</span>}
              </pre>
            ) : (
              <span className="text-gray-500">
                {isRecording ? 'Speak or rap — words appear here in real time' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Saved Recordings */}
      <div>
        <h3 className="font-semibold text-white mb-3">Saved Recordings ({recordings.length})</h3>
        {recordings.length === 0 ? (
          <div className="rounded-xl p-8 text-center text-gray-500 text-sm" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            No recordings yet. Tap <strong className="text-gray-300">Auto-Detect</strong> and start rapping, or tap <strong className="text-gray-300">Record Now</strong>.
          </div>
        ) : (
          <div className="space-y-2">
            {recordings.map(rec => (
              <div key={rec.id} className="rounded-lg p-4" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{rec.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{rec.duration} · {rec.timestamp} · {rec.lyrics.split('\n').filter(Boolean).length} lines</div>
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
                {rec.audioUrl && (
                  <audio controls src={rec.audioUrl} className="w-full mt-3" style={{ height: 36 }} />
                )}
                {onGenerateBeat && (
                  <button
                    onClick={() => onGenerateBeat({ id: rec.id, name: rec.name, lyrics: rec.lyrics, duration: rec.duration })}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,0,230,0.15)', color: '#ff00e6', border: '1px solid rgba(255,0,230,0.3)' }}>
                    🎵 Generate Beat from this Flow
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
