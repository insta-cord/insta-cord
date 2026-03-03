import { useState } from 'react'
import AudioRecorder from './AudioRecorder'
import BeatMaker from './BeatMaker'
import StudioMastering from './StudioMastering'

const TABS = [
  { id: 'record', label: '🎙 Record', desc: 'Capture your flow' },
  { id: 'beats', label: '🥁 Beat Maker', desc: '16-step sequencer' },
  { id: 'master', label: '🎚 Mastering', desc: 'Professional mix' },
]

export default function RecordingStudio() {
  const [activeTab, setActiveTab] = useState('record')
  const [savedRecordings, setSavedRecordings] = useState<{ id: string; name: string; lyrics: string; duration: string }[]>([])
  const [selectedRecording, setSelectedRecording] = useState<{ id: string; name: string; lyrics: string; duration: string } | null>(null)
  const [autoBeating, setAutoBeating] = useState(false)
  const [autoGenDone, setAutoGenDone] = useState(false)
  const [autoGenPreset, setAutoGenPreset] = useState('')

  // Called from AudioRecorder when a recording is saved
  const handleRecordingSaved = (rec: { id: string; name: string; lyrics: string; duration: string }) => {
    setSavedRecordings(prev => [rec, ...prev])
  }

  // Auto-generate beat based on lyrics content
  const autoGenerateBeat = (rec: { id: string; name: string; lyrics: string; duration: string }) => {
    setSelectedRecording(rec)
    setAutoBeating(true)
    setAutoGenDone(false)

    // Analyze lyrics to pick a beat style
    const lowerLyrics = rec.lyrics.toLowerCase()
    let preset = 'Hip-Hop'
    if (lowerLyrics.includes('trap') || lowerLyrics.includes('drip') || lowerLyrics.includes('gang')) {
      preset = 'Trap'
    }

    setAutoGenPreset(preset)

    setTimeout(() => {
      setAutoBeating(false)
      setAutoGenDone(true)
      setActiveTab('beats')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Recording Studio</h2>
        <p className="text-gray-400 text-sm mt-1">Record your flow → auto-generate a beat → master your track</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: '#1a1f24' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all text-left"
            style={{
              background: activeTab === tab.id ? '#2a3439' : 'transparent',
              color: activeTab === tab.id ? '#00f0ff' : '#888',
              border: activeTab === tab.id ? '1px solid #3a464d' : '1px solid transparent',
            }}>
            <div>{tab.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Auto-generating beat notice */}
      {autoBeating && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,0,230,0.1)', border: '1px solid #ff00e6' }}>
          <span style={{ color: '#ff00e6', fontSize: 20 }}>🎵</span>
          <div>
            <div className="font-bold text-white">Synthesizing beat from your flow...</div>
            <div className="text-xs text-gray-400 mt-0.5">Analyzing rhythm and cadence of your lyrics</div>
          </div>
          <div className="ml-auto flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 rounded-full"
                style={{
                  height: `${16 + Math.random() * 20}px`,
                  background: '#ff00e6',
                  animation: `pulse ${0.3 + i * 0.1}s infinite alternate`
                }} />
            ))}
          </div>
        </div>
      )}

      {/* Beat generated notice */}
      {autoGenDone && selectedRecording && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid #00ff88' }}>
          <span style={{ color: '#00ff88', fontSize: 20 }}>✓</span>
          <div className="flex-1">
            <div className="font-bold text-white">Beat generated for "{selectedRecording.name}"</div>
            <div className="text-xs text-gray-400 mt-0.5">{autoGenPreset} pattern loaded — customize it in Beat Maker below</div>
          </div>
          <button onClick={() => setAutoGenDone(false)}
            className="text-gray-500 hover:text-white text-sm">✕</button>
        </div>
      )}

      {/* Saved Recordings — quick access to generate beats */}
      {savedRecordings.length > 0 && activeTab !== 'record' && (
        <div className="rounded-xl p-4" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
          <div className="text-xs text-gray-400 mb-2 font-medium">YOUR RECORDINGS — tap to generate a beat</div>
          <div className="flex flex-wrap gap-2">
            {savedRecordings.map(rec => (
              <button key={rec.id}
                onClick={() => autoGenerateBeat(rec)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{
                  background: selectedRecording?.id === rec.id ? 'rgba(255,0,230,0.2)' : 'rgba(0,240,255,0.08)',
                  color: selectedRecording?.id === rec.id ? '#ff00e6' : '#00f0ff',
                  border: `1px solid ${selectedRecording?.id === rec.id ? '#ff00e6' : 'rgba(0,240,255,0.2)'}`,
                }}>
                🎙 {rec.name} ({rec.duration})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'record' && (
          <AudioRecorder
            onRecordingSaved={handleRecordingSaved}
            onGenerateBeat={autoGenerateBeat}
          />
        )}
        {activeTab === 'beats' && (
          <BeatMaker autoPreset={autoGenDone ? autoGenPreset : undefined} />
        )}
        {activeTab === 'master' && <StudioMastering />}
      </div>
    </div>
  )
}
