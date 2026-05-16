import React from 'react'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User
  onSignOut: () => void
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
}

const RacketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22">
    <ellipse cx="16" cy="12" rx="8" ry="9.5" fill="#2D6A4F" stroke="#2D6A4F" strokeWidth="2"/>
    <line x1="9"  y1="9.5"  x2="23" y2="9.5"  stroke="white" strokeWidth="1"/>
    <line x1="8"  y1="12"   x2="24" y2="12"   stroke="white" strokeWidth="1"/>
    <line x1="9"  y1="14.5" x2="23" y2="14.5" stroke="white" strokeWidth="1"/>
    <line x1="13" y1="3"    x2="13" y2="21"   stroke="white" strokeWidth="1"/>
    <line x1="16" y1="2.5"  x2="16" y2="21.5" stroke="white" strokeWidth="1"/>
    <line x1="19" y1="3"    x2="19" y2="21"   stroke="white" strokeWidth="1"/>
    <ellipse cx="16" cy="12" rx="8" ry="9.5" fill="none" stroke="#2D6A4F" strokeWidth="2"/>
    <path d="M13.5 21.5 L14.2 25 L17.8 25 L18.5 21.5" fill="none" stroke="#2D6A4F" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="14.2" y="24.5" width="3.6" height="5.5" rx="1.2" fill="#2D6A4F"/>
  </svg>
)

export function Header({ user, onSignOut, title = 'String Tracker', showBack, onBack, rightAction }: HeaderProps) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'User'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg text-ink/50 hover:text-ink hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {title === 'String Tracker' ? (
          <div className="flex-1 flex items-center gap-2">
            <RacketIcon />
            <span className="text-base font-bold text-brand">{title}</span>
          </div>
        ) : (
          <span className="flex-1 text-base font-bold text-ink truncate">{title}</span>
        )}

        {rightAction && <div>{rightAction}</div>}

        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full" aria-label="Account menu">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
                {initials}
              </div>
            )}
          </button>

          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-[14px] shadow-card border border-black/[0.06] py-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity z-50">
            <div className="px-3 py-2 border-b border-black/[0.06]">
              <p className="text-xs font-semibold text-ink truncate">{name}</p>
              <p className="text-xs text-ink/50 truncate">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-[14px]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
