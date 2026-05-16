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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <span className="flex-1 text-base font-semibold text-slate-900 truncate">{title}</span>

        {rightAction && <div>{rightAction}</div>}

        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full" aria-label="Account menu">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-medium flex items-center justify-center">
                {initials}
              </div>
            )}
          </button>

          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-900 truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
