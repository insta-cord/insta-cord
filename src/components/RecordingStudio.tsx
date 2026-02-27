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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Recording Studio</h2>
        <p className="text-gray-400 text-sm mt-1">Your complete professional studio in the browser</p>
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

      {/* Content */}
      <div>
        {activeTab === 'record' && <AudioRecorder />}
        {activeTab === 'beats' && <BeatMaker />}
        {activeTab === 'master' && <StudioMastering />}
      </div>
    </div>
  )
}
