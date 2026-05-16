import { useState } from 'react'
import { supabase } from '../lib/supabase'

const RacketSVG = ({ size = 90 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size}>
    <rect width="32" height="32" rx="6" fill="#2D6A4F"/>
    <ellipse cx="16" cy="12" rx="8" ry="9.5" fill="#2D6A4F" stroke="#2D6A4F" strokeWidth="2"/>
    <line x1="9"  y1="9.5"  x2="23" y2="9.5"  stroke="white" strokeWidth="1"/>
    <line x1="8"  y1="12"   x2="24" y2="12"   stroke="white" strokeWidth="1"/>
    <line x1="9"  y1="14.5" x2="23" y2="14.5" stroke="white" strokeWidth="1"/>
    <line x1="13" y1="3"    x2="13" y2="21"   stroke="white" strokeWidth="1"/>
    <line x1="16" y1="2.5"  x2="16" y2="21.5" stroke="white" strokeWidth="1"/>
    <line x1="19" y1="3"    x2="19" y2="21"   stroke="white" strokeWidth="1"/>
    <ellipse cx="16" cy="12" rx="8" ry="9.5" fill="none" stroke="white" strokeWidth="2"/>
    <path d="M13.5 21.5 L14.2 25 L17.8 25 L18.5 21.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="14.2" y="24.5" width="3.6" height="5.5" rx="1.2" fill="white"/>
  </svg>
)

export function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Top: icon + name + tagline */}
        <div className="flex flex-col items-center mb-10">
          <RacketSVG size={90} />
          <h1 className="mt-5 text-[28px] font-bold text-brand leading-tight">String Tracker</h1>
          <p className="mt-2 text-sm text-ink/40 text-center leading-relaxed">
            Know when to restring. Track what lasts.
          </p>
        </div>

        {/* Bottom: sign-in card */}
        <div className="w-full bg-white rounded-[20px] shadow-card p-7 flex flex-col items-center gap-5">
          {error && (
            <div className="w-full p-3 bg-red-50 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-muted active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign in with Google
          </button>

          <p className="text-xs text-ink/30 text-center">
            By signing in, you agree to our terms of service.
          </p>
        </div>

      </div>
    </div>
  )
}
