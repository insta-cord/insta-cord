import { useState, useEffect } from 'react'
import Nxcode from '@nxcode/sdk'

interface Tier {
  name: string
  price: string
  amount: number
  color: string
  features: string[]
  highlight?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0/mo',
    amount: 0,
    color: '#e8eaed',
    features: [
      'Basic AI transcription',
      'Up to 10 recordings/month',
      'Teleprompter display',
      'Basic beat maker',
      '500MB cloud storage',
    ],
  },
  {
    name: 'Lyricist',
    price: '$9/mo',
    amount: 9,
    color: '#00f0ff',
    highlight: true,
    features: [
      'Advanced AI transcription',
      'Unlimited recordings',
      'Lyric editor with rhyme suggestions',
      'Multi-track recording (4 tracks)',
      'Export lyrics to .txt/.pdf',
      '5GB cloud storage',
      'Cloud sync across devices',
    ],
  },
  {
    name: 'Producer',
    price: '$29/mo',
    amount: 29,
    color: '#ff00e6',
    features: [
      'Everything in Lyricist, plus:',
      'Professional-grade mastering',
      'Auto-Tune & pitch correction',
      'Advanced reverb & effects',
      'Sample library (100+ sounds)',
      'Stem separation (vocals/beats)',
      '50GB cloud storage',
      'Priority AI processing',
    ],
  },
  {
    name: 'Professional',
    price: '$79/mo',
    amount: 79,
    color: '#ffd700',
    features: [
      'Everything in Producer, plus:',
      'Collaboration features',
      'Commercial license included',
      'Unlimited cloud storage',
      'Unlimited saves',
      'Ghost Listener (always-on detection)',
      'Dedicated support',
    ],
  },
]

export default function PricingTiers() {
  const [currentTier, setCurrentTier] = useState('Free')
  const [processing, setProcessing] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const unsub = Nxcode.auth.onAuthStateChange((u: any) => setUser(u))
    return () => unsub()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleUpgrade = async (tier: Tier) => {
    if (tier.amount === 0) return

    // Must be logged in
    if (!Nxcode.auth.isLoggedIn()) {
      try {
        await Nxcode.auth.login()
      } catch {
        showMessage('Login required to upgrade', 'error')
        return
      }
    }

    setProcessing(tier.name)

    try {
      const result = await Nxcode.payment.charge({
        amount: tier.amount,
        description: `INSTA-CORD ${tier.name} Plan - 1 Month`,
        metadata: { plan: tier.name, duration: '1 month' }
      })

      if (result.success) {
        setCurrentTier(tier.name)
        showMessage(`✓ You're now on the ${tier.name} plan!`, 'success')
      } else if (result.error?.includes('Insufficient')) {
        if (confirm('Insufficient balance. Would you like to top up your account?')) {
          Nxcode.billing.topUp()
        }
      } else {
        showMessage('Payment failed: ' + result.error, 'error')
      }
    } catch (err: any) {
      showMessage('Payment failed: ' + err.message, 'error')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Choose Your Studio Tier</h2>
        <p className="text-gray-400 text-sm mt-1">Professional tools for every level of artist</p>
      </div>

      {/* Message */}
      {message && (
        <div className="rounded-lg p-4 font-medium text-sm"
          style={{
            background: message.type === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,85,0.1)',
            border: `1px solid ${message.type === 'success' ? '#00ff88' : '#ff0055'}`,
            color: message.type === 'success' ? '#00ff88' : '#ff0055',
          }}>
          {message.text}
        </div>
      )}

      {/* Current tier */}
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#1a2428', border: '1px solid #2a3439' }}>
        <span className="text-sm text-gray-400">Current Tier:</span>
        <span className="font-bold" style={{ color: TIERS.find(t => t.name === currentTier)?.color || '#e8eaed' }}>
          {currentTier}
        </span>
        {user && <span className="text-xs text-gray-500 ml-auto">Logged in as {user.email}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map(tier => {
          const isCurrentTier = currentTier === tier.name
          const isProcessing = processing === tier.name

          return (
            <div key={tier.name}
              className="rounded-xl p-5 flex flex-col transition-all"
              style={{
                background: tier.highlight ? '#1a2428' : '#1a1f24',
                border: `1px solid ${isCurrentTier ? tier.color : tier.highlight ? tier.color + '40' : '#2a3439'}`,
                boxShadow: isCurrentTier ? `0 0 15px ${tier.color}30` : tier.highlight ? `0 0 10px ${tier.color}20` : 'none',
              }}>
              {tier.highlight && (
                <div className="text-xs font-bold mb-3 px-2 py-1 rounded-full text-center w-fit"
                  style={{ background: tier.color + '20', color: tier.color }}>
                  MOST POPULAR
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold" style={{ color: tier.color }}>{tier.name}</h3>
                <div className="text-2xl font-bold text-white mt-1">{tier.price}</div>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier)}
                disabled={isCurrentTier || isProcessing || tier.amount === 0 && currentTier !== 'Free'}
                className="w-full py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
                style={{
                  background: isCurrentTier ? tier.color + '20' : tier.color,
                  color: isCurrentTier ? tier.color : '#000',
                  border: isCurrentTier ? `1px solid ${tier.color}` : 'none',
                  cursor: isCurrentTier ? 'default' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1,
                }}>
                {isCurrentTier ? 'Current Tier' :
                 isProcessing ? 'Processing...' :
                 tier.amount === 0 ? 'Free' :
                 `Upgrade — ${tier.price}`}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-500">
        All payments are processed securely through the Nxcode platform. Cancel anytime. No hidden fees.<br />
        * All tiers include access to core recording features. Higher tiers unlock advanced tools and unlimited usage.
      </p>
    </div>
  )
}
