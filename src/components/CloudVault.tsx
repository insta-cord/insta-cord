import { useState } from 'react'

interface VaultItem {
  id: string
  name: string
  type: 'recording' | 'lyrics' | 'beat' | 'mastered'
  size: string
  date: string
  synced: boolean
}

const TYPE_ICONS: Record<string, string> = {
  recording: '🎙',
  lyrics: '📝',
  beat: '🥁',
  mastered: '🎚',
}

export default function CloudVault() {
  const [items, setItems] = useState<VaultItem[]>([
    { id: '1', name: 'Session_001_bars.mp3', type: 'recording', size: '4.2 MB', date: '2 hours ago', synced: true },
    { id: '2', name: 'Verse_02_lyrics.txt', type: 'lyrics', size: '12 KB', date: 'Yesterday', synced: true },
    { id: '3', name: 'Trap_beat_90bpm.wav', type: 'beat', size: '8.7 MB', date: '3 days ago', synced: false },
    { id: '4', name: 'Final_mix_mastered.mp3', type: 'mastered', size: '11.2 MB', date: '1 week ago', synced: true },
    { id: '5', name: 'Hook_take_3.mp3', type: 'recording', size: '2.1 MB', date: '1 week ago', synced: true },
  ])
  const [filter, setFilter] = useState<string>('all')
  const [syncing, setSyncing] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const syncItem = (id: string) => {
    setSyncing(true)
    setTimeout(() => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, synced: true } : i))
      setSyncing(false)
    }, 1500)
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const copyLink = (name: string) => {
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalSize = '26.3 MB'
  const syncedCount = items.filter(i => i.synced).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cloud Vault</h2>
        <p className="text-gray-400 text-sm mt-1">Cloud sync across devices · Unlimited cloud storage</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Files', value: items.length.toString(), color: '#00f0ff' },
          { label: 'Synced', value: `${syncedCount}/${items.length}`, color: '#00ff88' },
          { label: 'Storage Used', value: totalSize, color: '#ff00e6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'recording', 'lyrics', 'beat', 'mastered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize"
            style={{
              background: filter === f ? '#00f0ff' : '#1a1f24',
              color: filter === f ? '#000' : '#e8eaed',
              border: `1px solid ${filter === f ? '#00f0ff' : '#2a3439'}`,
            }}>
            {f === 'all' ? 'All Files' : TYPE_ICONS[f] + ' ' + f}
          </button>
        ))}
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-8 text-center text-gray-500" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            No files in this category
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id}
              className="rounded-lg p-4 flex items-center gap-3 transition-colors hover:border-gray-600"
              style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
              <div className="text-2xl">{TYPE_ICONS[item.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{item.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.size} · {item.date}</div>
              </div>
              <div className="flex items-center gap-1 mr-2">
                {item.synced ? (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                    ✓ Synced
                  </span>
                ) : (
                  <button onClick={() => syncItem(item.id)}
                    className="text-xs px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,170,0,0.15)', color: '#ffaa00' }}>
                    {syncing ? '↻ Syncing...' : '↑ Sync'}
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => copyLink(item.name)}
                  className="p-1.5 rounded transition-colors hover:text-white"
                  style={{ color: copied === item.name ? '#00ff88' : '#666' }}
                  title="Copy link">
                  {copied === item.name ? '✓' : '🔗'}
                </button>
                <button onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded transition-colors text-gray-500 hover:text-red-400"
                  title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Zone */}
      <div className="rounded-xl p-8 text-center cursor-pointer transition-all hover:border-cyan-400"
        style={{ background: '#1a2428', border: '2px dashed #2a3439' }}>
        <div className="text-3xl mb-2">☁</div>
        <p className="text-gray-300 font-medium">Drop files here or click to upload</p>
        <p className="text-gray-500 text-sm mt-1">MP3, WAV, TXT, PDF supported</p>
      </div>
    </div>
  )
}
