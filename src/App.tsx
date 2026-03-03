import { useState, useEffect } from 'react'
import './index.css'
import Nxcode from '@nxcode/sdk'
import RecordingStudio from './components/RecordingStudio'
import Teleprompter from './components/Teleprompter'
import CloudVault from './components/CloudVault'
import PricingTiers from './components/PricingTiers'
import UserDashboard from './components/UserDashboard'
import Settings from './components/Settings'

const NAV_ITEMS = [
  { id: 'studio', label: 'Studio', icon: '🎙' },
  { id: 'teleprompter', label: 'Teleprompter', icon: '📺' },
  { id: 'vault', label: 'Cloud Vault', icon: '☁' },
  { id: 'pricing', label: 'Pricing', icon: '💎' },
  { id: 'dashboard', label: 'Dashboard', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await Nxcode.auth.login()
      onLogin()
    } catch (e: any) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0f1419' }}>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4" style={{ width: 120, height: 120 }}>
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#00f0ff',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#ff00e6',stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#c8a882',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#a0784a',stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="booth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#1a2a3a',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#0f1419',stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#ffe066',stopOpacity:1}} />
                <stop offset="40%" style={{stopColor:'#FFD700',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#b8860b',stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#fff3a0',stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:'#FFD700',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#8B6914',stopOpacity:1}} />
              </linearGradient>
            </defs>

            {/* Recording booth window frame */}
            <rect x="2" y="2" width="116" height="116" rx="12" fill="url(#booth)" stroke="#2a3a4a" strokeWidth="2"/>

            {/* Gold decorative top banner */}
            <rect x="2" y="2" width="116" height="14" rx="10" fill="url(#gold)" opacity="0.92"/>
            <rect x="2" y="10" width="116" height="6" fill="url(#gold)" opacity="0.85"/>
            {/* Gold accent dots */}
            <circle cx="12" cy="9" r="2" fill="#ffe066" opacity="0.9"/>
            <circle cx="60" cy="9" r="2.5" fill="#fff3a0" opacity="0.95"/>
            <circle cx="108" cy="9" r="2" fill="#ffe066" opacity="0.9"/>
            <circle cx="36" cy="9" r="1.2" fill="#FFD700" opacity="0.7"/>
            <circle cx="84" cy="9" r="1.2" fill="#FFD700" opacity="0.7"/>
            {/* Gold trim line */}
            <line x1="2" y1="16" x2="118" y2="16" stroke="#FFD700" strokeWidth="1" opacity="0.6"/>

            {/* Booth glass reflection */}
            <rect x="6" y="18" width="108" height="44" rx="8" fill="none" stroke="#1e3a5a" strokeWidth="1" opacity="0.5"/>

            {/* Person body / jacket */}
            <path d="M30 95 Q30 75 45 70 L55 68 L65 68 L75 70 Q90 75 90 95 L90 118 L30 118 Z"
              fill="#1a1f24" stroke="#2a3439" strokeWidth="1"/>

            {/* Person neck */}
            <rect x="53" y="58" width="14" height="14" rx="4" fill="url(#skin)"/>

            {/* Person head */}
            <ellipse cx="60" cy="47" rx="16" ry="18" fill="url(#skin)"/>

            {/* Hair */}
            <path d="M44 42 Q44 24 60 24 Q76 24 76 42 Q76 32 60 30 Q44 32 44 42 Z" fill="#1a0a00"/>

            {/* Eyes */}
            <ellipse cx="54" cy="44" rx="2.5" ry="3" fill="#1a0a00"/>
            <ellipse cx="66" cy="44" rx="2.5" ry="3" fill="#1a0a00"/>
            <circle cx="55" cy="43" r="0.8" fill="white" opacity="0.6"/>
            <circle cx="67" cy="43" r="0.8" fill="white" opacity="0.6"/>

            {/* Nose */}
            <path d="M59 48 Q57 52 60 53 Q63 52 61 48" fill="none" stroke="#8a6040" strokeWidth="1" strokeLinecap="round"/>

            {/* Mouth open rapping */}
            <path d="M53 58 Q60 62 67 58" stroke="#1a0a00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="60" cy="59" rx="5" ry="3" fill="#8a2020" opacity="0.8"/>
            <ellipse cx="60" cy="59" rx="3" ry="1.5" fill="#cc3333" opacity="0.6"/>

            {/* Headphones */}
            <path d="M44 40 Q44 22 60 22 Q76 22 76 40" stroke="#00f0ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <rect x="40" y="38" width="8" height="12" rx="4" fill="#00f0ff" opacity="0.9"/>
            <rect x="72" y="38" width="8" height="12" rx="4" fill="#00f0ff" opacity="0.9"/>

            {/* Music notes flowing from mouth */}
            <text x="70" y="55" fontSize="9" fill="#00f0ff" opacity="1" style={{fontFamily:'serif'}}>♪</text>
            <text x="80" y="47" fontSize="11" fill="#aa88ff" opacity="0.95" style={{fontFamily:'serif'}}>♫</text>
            <text x="91" y="54" fontSize="8" fill="#ff00e6" opacity="0.9" style={{fontFamily:'serif'}}>♪</text>

            {/* Flow curve from mouth to mic */}
            <path d="M68 57 Q78 52 88 54 Q95 55 98 58"
              stroke="url(#grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"
              strokeDasharray="3 2"/>

            {/* Mic stand arm — gold */}
            <line x1="101" y1="34" x2="101" y2="90" stroke="url(#gold)" strokeWidth="3" strokeLinecap="round"/>
            <line x1="91" y1="90" x2="112" y2="90" stroke="url(#gold)" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="101" cy="90" rx="7" ry="2.5" fill="url(#gold)" opacity="0.6"/>

            {/* Gold mic body */}
            <rect x="93" y="34" width="16" height="30" rx="8" fill="url(#gold)"/>
            <rect x="94" y="35" width="14" height="28" rx="7" fill="url(#goldShine)" opacity="0.35"/>
            {/* Mic grille lines (dark on gold) */}
            <line x1="96" y1="42" x2="107" y2="42" stroke="#5a3a00" strokeWidth="0.9" opacity="0.55"/>
            <line x1="96" y1="46" x2="107" y2="46" stroke="#5a3a00" strokeWidth="0.9" opacity="0.55"/>
            <line x1="96" y1="50" x2="107" y2="50" stroke="#5a3a00" strokeWidth="0.9" opacity="0.55"/>
            <line x1="96" y1="54" x2="107" y2="54" stroke="#5a3a00" strokeWidth="0.9" opacity="0.55"/>
            {/* Mic shine highlight */}
            <rect x="96" y="36" width="4" height="14" rx="2" fill="white" opacity="0.2"/>
            {/* Mic gold outer border */}
            <rect x="93" y="34" width="16" height="30" rx="8" fill="none" stroke="#ffe066" strokeWidth="1.5" opacity="0.8"/>
            {/* Mic top dome cap */}
            <ellipse cx="101" cy="34" rx="8" ry="4" fill="url(#goldShine)" opacity="0.95"/>

            {/* REC light */}
            <circle cx="110" cy="22" r="4" fill="#ff0055" opacity="0.9"/>
            <circle cx="110" cy="22" r="6" fill="none" stroke="#ff0055" strokeWidth="1" opacity="0.4"/>
            <text x="98" y="25" fontSize="5" fill="#ff0055" fontWeight="bold">REC</text>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">INSTA-CORD</h1>
        <p className="text-lg font-bold mb-1" style={{ color: '#FFD700', letterSpacing: '0.08em' }}>BARS NOT LOST</p>
      </div>

      {/* Features */}
      <div className="w-full max-w-sm mb-8 space-y-3">
        {[
          { icon: '🎙', text: 'Record & master your music' },
          { icon: '📺', text: 'Teleprompter for live performance' },
          { icon: '☁', text: 'Cloud vault for your tracks' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xl">{f.icon}</span>
            <span className="text-gray-300 text-sm">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Login Button */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all"
          style={{
            background: loading ? 'rgba(0,240,255,0.3)' : 'linear-gradient(135deg, #00f0ff, #ff00e6)',
            color: '#000',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? 'Signing in...' : 'Sign In with Google'}
        </button>

        {error && (
          <p className="text-center text-sm" style={{ color: '#ff4444' }}>{error}</p>
        )}

        <p className="text-center text-xs text-gray-500">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('studio')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already logged in
    const currentUser = Nxcode.auth.getUser()
    if (currentUser) setUser(currentUser)
    setLoading(false)

    const unsub = Nxcode.auth.onAuthStateChange((u: any) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    try {
      await Nxcode.auth.logout()
      setUser(null)
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1419' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00e6)', color: '#000' }}>
            IC
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in — show login page
  if (!user) {
    return <LoginPage onLogin={() => {}} />
  }

  // Logged in — show main app
  return (
    <div className="min-h-screen" style={{ background: '#0f1419', color: '#e8eaed' }}>
      {/* Top Nav */}
      <header style={{ background: '#1a1f24', borderBottom: '1px solid #2a3439' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00e6)', color: '#000' }}>
              IC
            </div>
            <div>
              <span className="font-bold text-white text-lg">INSTA-CORD</span>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">Automatic Lyric Memorizer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
            <button onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(255,0,85,0.1)', color: '#ff0055', border: '1px solid rgba(255,0,85,0.3)' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 min-h-screen"
          style={{ borderRight: '1px solid #2a3439' }}>
          <nav className="space-y-1 mt-4">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  background: activeTab === item.id ? 'rgba(0,240,255,0.1)' : 'transparent',
                  color: activeTab === item.id ? '#00f0ff' : '#888',
                  border: activeTab === item.id ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
                }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4" style={{ borderTop: '1px solid #2a3439' }}>
            <div className="text-xs px-3 py-2">
              <div className="text-gray-400 mb-1">Signed in as</div>
              <div className="text-white truncate">{user.name || user.email}</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {activeTab === 'studio' && <RecordingStudio />}
          {activeTab === 'teleprompter' && <Teleprompter />}
          {activeTab === 'vault' && <CloudVault />}
          {activeTab === 'pricing' && <PricingTiers />}
          {activeTab === 'dashboard' && <UserDashboard />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex"
        style={{ background: '#1a1f24', borderTop: '1px solid #2a3439' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-all"
            style={{ color: activeTab === item.id ? '#00f0ff' : '#555' }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
