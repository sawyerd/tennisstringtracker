import React from 'react'
import { NavLink } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Header } from './Header'

interface LayoutProps {
  user: User
  onSignOut: () => void
  children: React.ReactNode
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  showNav?: boolean
}

export function Layout({
  user,
  onSignOut,
  children,
  title,
  showBack,
  onBack,
  rightAction,
  showNav = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header
        user={user}
        onSignOut={onSignOut}
        title={title}
        showBack={showBack}
        onBack={onBack}
        rightAction={rightAction}
      />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-28">
        {children}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 safe-bottom">
          <div className="max-w-lg mx-auto flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    className="w-5 h-5"
                    fill={isActive ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isActive ? 0 : 1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  <span>Home</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    className="w-5 h-5"
                    fill={isActive ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isActive ? 0 : 1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                  <span>Stats</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}
