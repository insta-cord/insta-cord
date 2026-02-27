import { useState, useEffect } from 'react'
import Nxcode from '@nxcode/sdk'

const ADMIN_EMAIL = 'd67505901@gmail.com'

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingBalance, setLoadingBalance] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL

  const recentActivity = [
    { action: 'Recorded new session', time: '2 hours ago', icon: '🎙' },
    { action: 'Saved to Cloud Vault', time: '2 hours ago', icon: '☁' },
    { action: 'Beat: Trap 140bpm created', time: 'Yesterday', icon: '🥁' },
    { action: 'Mastered "Verse 01"', time: '3 days ago', icon: '🎚' },
    { action: 'Exported lyrics to PDF', time: '1 week ago', icon: '📄' },
  ]

  useEffect(() => {
    const unsub = Nxcode.auth.onAuthStateChange((u: any) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadEarnings()
    }
  }, [isAdmin])

  const loadEarnings = async () => {
    setLoadingBalance(true)
    try {
      const u = Nxcode.auth.getUser()
      if (u) setBalance(u.balance ?? 0)
      const txs = await Nxcode.payment.getTransactions(10, 0)
      setTransactions(txs || [])
    } catch (e) {
      console.error('Failed to fetch balance', e)
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleLogin = async () => {
    try { await Nxcode.auth.login() } catch {}
  }

  const handleLogout = async () => {
    try { await Nxcode.auth.logout() } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="rounded-xl p-6" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00e6)', color: '#000' }}>
            {user ? (user.name?.[0] || user.email?.[0] || 'A').toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {user ? (user.name || user.email) : 'Not logged in'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {user ? (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)' }}>
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                  <button onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-2">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={handleLogin}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)' }}>
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN ONLY: Earnings Panel */}
      {isAdmin && (
        <div className="rounded-xl p-6 space-y-4"
          style={{ background: '#0a1f12', border: '2px solid #00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#00ff88' }}>💰 Your Earnings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Only visible to you</p>
            </div>
            <button onClick={loadEarnings}
              className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
              {loadingBalance ? '↻ Loading...' : '↻ Refresh'}
            </button>
          </div>

          {/* Balance */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <div className="text-xs text-gray-400 mb-1">Current Balance</div>
            <div className="text-4xl font-bold" style={{ color: '#00ff88' }}>
              {loadingBalance ? '...' : balance !== null ? `${balance} C$` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">You earn 70% of every payment</div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Recent Payments Received</h4>
            {transactions.length === 0 ? (
              <div className="text-sm text-gray-500 py-3 text-center">
                No transactions yet — share your app to start earning!
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
                    <div>
                      <div className="text-sm text-white">{tx.description}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: '#00ff88' }}>+{Math.round(tx.amount * 0.7)} C$</div>
                      <div className="text-xs text-gray-500">your 70%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Recordings', value: '24', color: '#00f0ff', icon: '🎙' },
          { label: 'Total Time', value: '3h 42m', color: '#00ff88', icon: '⏱' },
          { label: 'Lines Recorded', value: '312', color: '#ff00e6', icon: '📝' },
          { label: 'Day Streak', value: '7 days', color: '#ffd700', icon: '🔥' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: '#1a1f24', border: '1px solid #2a3439' }}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-white mb-3">Recent Activity</h3>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a3439' }}>
          {recentActivity.map((item, i) => (
            <div key={i}
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #1a2428' : 'none', background: '#1a1f24' }}>
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="text-sm text-white">{item.action}</div>
              </div>
              <div className="text-xs text-gray-500">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
