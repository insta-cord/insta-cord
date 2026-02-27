import { useState, useEffect } from 'react'
import './index.css'
import Nxcode from '@nxcode/sdk'
import RecordingStudio from './components/RecordingStudio'
import Teleprompter from './components/Teleprompter'
import CloudVault from './components/CloudVault'
import PricingTiers from './components/PricingTiers'
import UserDashboard from './components/UserDashboard'

const NAV_ITEMS = [
  { id: 'studio', label: 'Studio', icon: '🎙' },
  { id: 'teleprompter', label: 'Teleprompter', icon: '📺' },
  { id: 'vault', label: 'Cloud Vault', icon: '☁' },
  { id: 'pricing', label: 'Pricing', icon: '💎' },
  { id: 'dashboard', label: 'Dashboard', icon: '👤' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('studio')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsub = Nxcode.auth.onAuthStateChange((u: any) => setUser(u))
    return () => unsub()
  }, [])

  const handleLogin = async () => {
    try {
      await Nxcode.auth.login()
    } catch (e) {
      console.error('Login failed:', e)
    }
  }

  const handleLogout = async () => {
    try {
      await Nxcode.auth.logout()
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

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
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
              <button onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(255,0,85,0.1)', color: '#ff0055', border: '1px solid rgba(255,0,85,0.3)' }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin}
              className="text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)' }}>
              Login / Sign Up
            </button>
          )}
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
            {user ? (
              <div className="text-xs px-3 py-2">
                <div className="text-gray-400 mb-1">Signed in as</div>
                <div className="text-white truncate">{user.name || user.email}</div>
              </div>
            ) : (
              <button onClick={handleLogin}
                className="w-full text-xs px-3 py-2 rounded-lg text-left transition-all hover:opacity-80"
                style={{ background: 'rgba(0,240,255,0.05)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)' }}>
                Login to save progress →
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {activeTab === 'studio' && <RecordingStudio />}
          {activeTab === 'teleprompter' && <Teleprompter />}
          {activeTab === 'vault' && <CloudVault />}
          {activeTab === 'pricing' && <PricingTiers />}
          {activeTab === 'dashboard' && <UserDashboard />}
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
