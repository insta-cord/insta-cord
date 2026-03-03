import { useState, useRef, useEffect } from 'react'

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
  const [isListening, setIsListening] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [sensitivity, setSensitivity] = useState(50)
  const [micLevel, setMicLevel] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [micError, setMicError] = useState('')
  const [autoDetected, setAutoDetected] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const autoStartedRef = useRef(false)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopEverything()
    }
  }, [])

  const stopEverything = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
    }
  }

  const getMicLevel = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    return avg
  }

  const startRecording = async () => {
    setMicError('')
    setLyrics('')
    setTranscript('')
    setElapsed(0)
    audioChunksRef.current = []
    autoStartedRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context for mic level visualization
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Animate mic level
      const animateMic = () => {
        const level = getMicLevel(analyser)
        setMicLevel(Math.round(level))
        animFrameRef.current = requestAnimationFrame(animateMic)
      }
      animateMic()

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mediaRecorder.start()

      // Set up speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognitionRef.current = recognition

        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += t + '\n'
            } else {
              interimTranscript += t
            }
          }
          if (finalTranscript) {
            setLyrics(prev => prev + finalTranscript)
          }
          setTranscript(interimTranscript)
        }

        recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.error('Speech recognition error:', e.error)
          }
        }

        recognition.onend = () => {
          // Restart recognition if still recording
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try { recognition.start() } catch {}
          }
        }

        recognition.start()
      }

      setIsRecording(true)
      setIsListening(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1)
      }, 1000)

    } catch (err: any) {
      setMicError('Microphone access denied. Please allow mic access and try again.')
    }
  }

  const stopRecording = () => {
    stopEverything()
    setIsRecording(false)
    setIsListening(false)
    setMicLevel(0)
    setTranscript('')
  }

  const saveRecording = () => {
    if (!lyrics.trim()) return
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const secs = (elapsed % 60).toString().padStart(2, '0')

    // Create audio blob URL if available
    let audioUrl: string | undefined
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioUrl = URL.createObjectURL(blob)
    }

    const rec: Recording = {
      id: Date.now().toString(),
      name: `Recording ${recordings.length + 1}`,
      duration: `${mins}:${secs}`,
      lyrics: lyrics.trim(),
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

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Auto-detect voice and start recording
  useEffect(() => {
    if (!isListening || isRecording) return

    let stream: MediaStream
    let audioCtx: AudioContext
    let analyser: AnalyserNode
    let animFrame: number
    const threshold = 100 - sensitivity

    const startListening = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)

        const checkVoice = () => {
          const level = getMicLevel(analyser)
          if (level > threshold && !autoStartedRef.current) {
            autoStartedRef.current = true
            setAutoDetected(true)
            stream.getTracks().forEach(t => t.stop())
            audioCtx.close()
            cancelAnimationFrame(animFrame)
            startRecording()
            setTimeout(() => setAutoDetected(false), 3000)
          }
          animFrame = requestAnimationFrame(checkVoice)
        }
        checkVoice()
      } catch {}
    }

    startListening()

    return () => {
      cancelAnimationFrame(animFrame)
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (audioCtx) try { audioCtx.close() } catch {}
    }
  }, [isListening, isRecording, sensitivity])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audio Recorder</h2>
          <p className="text-gray-400 text-sm mt-1">Starts automatically when you rap or rhyme</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: isRecording ? 'rgba(255,0,85,0.15)' : 'rgba(100,100,100,0.15)', border: '1px solid #ff0055', color: '#ff0055' }}>
          {isRecording ? (
            <><span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'pulse 1s infinite' }} /> RECORDING</>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-gray-500" /> IDLE</>
          )}
        </div>
      </div>

      {/* Mic Error */}
      {micError && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(255,0,85,0.1)', border: '1px solid #ff0055', color: '#ff0055' }}>
          {micError}
        </div>
      )}

      {/* Auto-detected */}
      {autoDetected && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', color: '#00f0ff' }}>
          🎤 Voice detected — recording started automatically!
        </div>
      )}

      {/* Controls */}
      <div className="rounded-xl p-6 space-y-5" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>

        {/* Sensitivity */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Auto-Start Sensitivity — {sensitivity < 30 ? 'Needs loud voice' : sensitivity < 70 ? 'Medium' : 'Triggers easily'}
          </label>
          <input type="range" min={0} max={100} value={sensitivity}
            onChange={e => setSensitivity(+e.target.value)}
            className="w-full accent-cyan-400" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Needs loud voice</span><span>Triggers easily</span>
          </div>
        </div>

        {/* Mic level bar */}
        {isRecording && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mic Level</label>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#2a3439' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, micLevel * 2)}%`, background: 'linear-gradient(90deg, #00f0ff, #ff00e6)' }} />
            </div>
          </div>
        )}

        {/* Waveform animation */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1.5 rounded-full"
                style={{
                  height: `${20 + (micLevel > 0 ? Math.random() * micLevel : 10)}%`,
                  background: '#00f0ff',
                  transition: 'height 0.1s',
                  animationDelay: `${i * 0.05}s`
                }} />
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
            <>
              <button onClick={startRecording}
                className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ background: '#00f0ff' }}>
                ● Start Recording
              </button>
              <button
                onClick={() => setIsListening(l => !l)}
                className="px-4 py-3 rounded-lg font-bold text-sm transition-all"
                style={{
                  background: isListening ? 'rgba(0,240,255,0.15)' : '#2a3439',
                  color: isListening ? '#00f0ff' : '#888',
                  border: isListening ? '1px solid #00f0ff' : '1px solid transparent'
                }}>
                {isListening ? '👂 Listening' : '👂 Auto-Detect'}
              </button>
            </>
          ) : (
            <button onClick={stopRecording}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{ background: '#ff0055', color: 'white' }}>
              ■ Stop Recording
            </button>
          )}
          <button onClick={saveRecording} disabled={!lyrics.trim() || isRecording}
            className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-40"
            style={{ background: lyrics.trim() && !isRecording ? '#00ff88' : '#2a3439', color: lyrics.trim() && !isRecording ? '#000' : '#666' }}>
            {saved ? '✓ Saved!' : 'Save'}
          </button>
        </div>

        {isListening && !isRecording && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#00f0ff' }}>
            <span>◉</span>
            <span>Ghost Listener active — will auto-start when you rap</span>
          </div>
        )}
      </div>

      {/* Live Lyrics */}
      <div className="rounded-xl p-5" style={{ background: '#1a2428', border: '1px solid #2a3439' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-white">Live Transcript</h3>
          {lyrics && <span className="text-xs text-gray-400">{lyrics.trim().split('\n').length} lines</span>}
        </div>
        <div className="min-h-32 rounded-lg p-4 font-mono text-sm"
          style={{ background: '#0f1419', border: '1px solid #2a3439', color: '#e8eaed' }}>
          {lyrics ? (
            <pre className="whitespace-pre-wrap">{lyrics}{transcript && <span style={{ color: '#888' }}>{transcript}</span>}</pre>
          ) : (
            <span className="text-gray-500">
              {isRecording ? 'Listening... speak or rap and your words will appear here' : 'Start recording or enable Auto-Detect to begin'}
            </span>
          )}
        </div>
      </div>

      {/* Saved Recordings */}
      <div>
        <h3 className="font-semibold text-white mb-3">Saved Recordings ({recordings.length})</h3>
        {recordings.length === 0 ? (
          <div className="rounded-xl p-8 text-center text-gray-500" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            No recordings yet. Hit record and start rapping.
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
