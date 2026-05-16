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

        <span className="flex-1 text-base font-bold text-ink truncate">{title}</span>

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
