import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { FAB } from '../components/layout/FAB'
import { Card } from '../components/ui/Card'
import { StatusDot } from '../components/ui/StatusDot'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Button } from '../components/ui/Button'
import { useRackets } from '../hooks/useRackets'
import { useSessions } from '../hooks/useSessions'
import type { RacketWithJob } from '../types'

interface HomePageProps {
  user: User
  onSignOut: () => void
}

function RacketCard({ racket, onRestring, onRetire }: {
  racket: RacketWithJob
  onRestring: () => void
  onRetire: () => void
}) {
  const job = racket.activeJob
  const pct = job ? Math.min(100, (racket.totalHours / job.hour_threshold) * 100) : 0

  const statusLabel = {
    green: 'Good',
    yellow: 'Getting worn',
    red: 'Restring soon',
    none: 'No strings',
  }

  const barColor = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    none: 'bg-slate-200',
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <StatusDot status={racket.status} size="lg" className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{racket.name}</h3>
            <Badge
              variant={
                racket.status === 'green'
                  ? 'green'
                  : racket.status === 'yellow'
                  ? 'yellow'
                  : racket.status === 'red'
                  ? 'red'
                  : 'gray'
              }
              className="flex-shrink-0"
            >
              {statusLabel[racket.status]}
            </Badge>
          </div>

          {job ? (
            <>
              <p className="text-sm text-slate-600 mt-0.5">
                {job.brand} {job.model} · {job.gauge}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {job.tension_mains}
                {job.tension_crosses ? `/${job.tension_crosses}` : ''} lbs ·{' '}
                {new Date(job.date_strung).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{racket.totalHours}h played</span>
                  <span className="text-xs text-slate-400">{job.hour_threshold}h threshold</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor[racket.status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={onRestring}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Restring
                </button>
                <button
                  onClick={onRetire}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Retire
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400 mt-0.5">No active strings</p>
              <button
                onClick={onRestring}
                className="mt-3 w-full py-1.5 px-3 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Add String Job
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

const TODAY = new Date().toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]

function HourStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const dec = () => onChange(Math.max(0.5, Math.round((value - 0.5) * 10) / 10))
  const inc = () => onChange(Math.min(8, Math.round((value + 0.5) * 10) / 10))
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={dec}
        className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 active:scale-95 transition-all text-lg font-medium"
      >
        −
      </button>
      <span className="w-14 text-center text-base font-semibold text-slate-900 tabular-nums">
        {value % 1 === 0 ? `${value}h` : `${value}h`}
      </span>
      <button
        type="button"
        onClick={inc}
        className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 active:scale-95 transition-all text-lg font-medium"
      >
        +
      </button>
    </div>
  )
}

// Quick Session Log bottom sheet
function SessionBottomSheet({
  open,
  onClose,
  rackets,
  onLogged,
}: {
  open: boolean
  onClose: () => void
  rackets: RacketWithJob[]
  onLogged: () => void
}) {
  const { logSession } = useSessions()
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'pick'>('today')
  const [customDate, setCustomDate] = useState(TODAY)
  const [selectedRackets, setSelectedRackets] = useState<Set<string>>(new Set())
  const [hours, setHours] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeRackets = rackets.filter((r) => r.activeJob !== null)
  const date = dateMode === 'today' ? TODAY : dateMode === 'yesterday' ? YESTERDAY : customDate

  const toggleRacket = (racketId: string) => {
    setSelectedRackets((prev) => {
      const next = new Set(prev)
      if (next.has(racketId)) {
        next.delete(racketId)
      } else {
        next.add(racketId)
        if (!hours[racketId]) setHours((h) => ({ ...h, [racketId]: 1 }))
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRackets.size === 0) { setError('Select at least one racket'); return }
    setLoading(true)
    setError(null)
    try {
      const entries = Array.from(selectedRackets).map((racketId) => {
        const racket = rackets.find((r) => r.id === racketId)!
        return { racket_id: racketId, string_job_id: racket.activeJob!.id, hours_played: hours[racketId] ?? 1 }
      })
      await logSession(date, entries)
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setSelectedRackets(new Set())
        setHours({})
        setDateMode('today')
        onLogged()
        onClose()
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log session')
      setLoading(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Session">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Date picker — pill toggle */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">When did you play?</p>
          <div className="flex gap-2">
            {(['today', 'yesterday', 'pick'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDateMode(mode)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                  dateMode === mode
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                {mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : 'Pick date'}
              </button>
            ))}
          </div>
          {dateMode === 'pick' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              max={TODAY}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            />
          )}
        </div>

        {/* Racket list */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Which rackets?</p>
          {activeRackets.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No rackets with active strings.</p>
          ) : (
            <div className="space-y-2">
              {activeRackets.map((racket) => {
                const selected = selectedRackets.has(racket.id)
                return (
                  <div
                    key={racket.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                      selected ? 'border-slate-900' : 'border-slate-100'
                    }`}
                  >
                    {/* Racket row — tap to select */}
                    <button
                      type="button"
                      onClick={() => toggleRacket(racket.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selected ? 'bg-slate-900' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <StatusDot status={racket.status} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selected ? 'text-white' : 'text-slate-900'}`}>
                          {racket.name}
                        </p>
                        <p className={`text-xs truncate ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {racket.activeJob!.brand} {racket.activeJob!.model} · {racket.totalHours}h on strings
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-white border-white' : 'border-slate-300'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Hours stepper — only visible when selected */}
                    {selected && (
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <span className="text-sm text-slate-600 font-medium">Hours played</span>
                        <HourStepper
                          value={hours[racket.id] ?? 1}
                          onChange={(v) => setHours((prev) => ({ ...prev, [racket.id]: v }))}
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
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={selectedRackets.size === 0 || done}
          className={`w-full transition-colors ${done ? '!bg-green-500' : ''}`}
        >
          {done ? '✓ Logged!' : `Log Session${selectedRackets.size > 0 ? ` · ${Array.from(selectedRackets).reduce((sum, id) => sum + (hours[id] ?? 1), 0)}h` : ''}`}
        </Button>
      </form>
    </BottomSheet>
  )
}

export function HomePage({ user, onSignOut }: HomePageProps) {
  const navigate = useNavigate()
  const { rackets, loading, error, refetch } = useRackets()
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false)

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title="String Tracker"
      rightAction={
        <button
          onClick={() => navigate('/rackets/new')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Add racket"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-2xl text-red-600 text-sm">{error}</div>
      ) : rackets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M3.5 12c0-2.5 1.5-5 4-6.5M20.5 12c0 2.5-1.5 5-4 6.5" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No rackets yet</h2>
          <p className="text-sm text-slate-500 mb-6">Add your first racket to start tracking string life.</p>
          <Button onClick={() => navigate('/rackets/new')}>Add Your First Racket</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Alerts for rackets needing restringing */}
          {rackets.some((r) => r.status === 'red') && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <p className="text-sm text-red-700">
                {rackets.filter((r) => r.status === 'red').length} racket
                {rackets.filter((r) => r.status === 'red').length !== 1 ? 's' : ''} need restringing
              </p>
            </div>
          )}

          {rackets.map((racket) => (
            <RacketCard
              key={racket.id}
              racket={racket}
              onRestring={() => navigate(`/rackets/${racket.id}/string`)}
              onRetire={() => navigate(`/rackets/${racket.id}/retire`)}
            />
          ))}
        </div>
      )}

      <FAB onClick={() => setSessionSheetOpen(true)} />

      <SessionBottomSheet
        open={sessionSheetOpen}
        onClose={() => setSessionSheetOpen(false)}
        rackets={rackets}
        onLogged={refetch}
      />
    </Layout>
  )
}
