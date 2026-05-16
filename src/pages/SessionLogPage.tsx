import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { StatusDot } from '../components/ui/StatusDot'
import { useSessions } from '../hooks/useSessions'
import { useRackets } from '../hooks/useRackets'

interface SessionLogPageProps {
  user: User
  onSignOut: () => void
}

export function SessionLogPage({ user, onSignOut }: SessionLogPageProps) {
  const navigate = useNavigate()
  const { logSession } = useSessions()
  const { rackets, loading: racketsLoading } = useRackets()

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRackets, setSelectedRackets] = useState<Set<string>>(new Set())
  const [hours, setHours] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeRackets = rackets.filter((r) => r.activeJob !== null)

  const toggleRacket = (racketId: string) => {
    setSelectedRackets((prev) => {
      const next = new Set(prev)
      if (next.has(racketId)) {
        next.delete(racketId)
      } else {
        next.add(racketId)
      }
      return next
    })
    if (!hours[racketId]) {
      setHours((prev) => ({ ...prev, [racketId]: '1' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRackets.size === 0) {
      setError('Select at least one racket')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const entries = Array.from(selectedRackets).map((racketId) => {
        const racket = rackets.find((r) => r.id === racketId)!
        return {
          racket_id: racketId,
          string_job_id: racket.activeJob!.id,
          hours_played: parseFloat(hours[racketId] || '1'),
        }
      })

      await logSession(date, entries)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log session')
      setLoading(false)
    }
  }

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title="Log Session"
      showBack
      onBack={() => navigate('/')}
      showNav={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Session Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          />
        </div>

        {/* Racket selection */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Which rackets did you use?
          </h3>

          {racketsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          ) : activeRackets.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No rackets with active strings. Add a string job first.
            </p>
          ) : (
            <div className="space-y-2">
              {activeRackets.map((racket) => {
                const selected = selectedRackets.has(racket.id)
                return (
                  <div key={racket.id}>
                    <button
                      type="button"
                      onClick={() => toggleRacket(racket.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                        selected
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                          selected ? 'bg-slate-900 border-slate-900' : 'border-slate-300'
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <StatusDot status={racket.status} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{racket.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {racket.activeJob!.brand} {racket.activeJob!.model}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {racket.totalHours}h
                      </span>
                    </button>

                    {selected && (
                      <div className="mt-2 ml-8 flex items-center gap-2">
                        <label className="text-xs text-slate-600 flex-shrink-0">Hours played:</label>
                        <input
                          type="number"
                          value={hours[racket.id] ?? '1'}
                          onChange={(e) =>
                            setHours((prev) => ({ ...prev, [racket.id]: e.target.value }))
                          }
                          min="0.1"
                          max="8"
                          step="0.5"
                          className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={selectedRackets.size === 0}
          className="w-full"
        >
          Log Session
        </Button>
      </form>
    </Layout>
  )
}
