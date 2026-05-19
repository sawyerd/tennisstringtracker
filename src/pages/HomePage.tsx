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
import { isHybrid } from '../types'

interface HomePageProps {
  user: User
  onSignOut: () => void
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function RacketCard({ racket, onRestring, onRename }: {
  racket: RacketWithJob
  onRestring: () => void
  onRename: (name: string) => Promise<void>
}) {
  const job = racket.activeJob
  const pct = job ? Math.min(100, (racket.totalHours / job.hour_threshold) * 100) : 0
  const hybrid = job ? isHybrid(job) : false

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(racket.name)
  const [renaming, setRenaming] = useState(false)

  const handleRenameConfirm = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setRenaming(true)
    try {
      await onRename(trimmed)
      setEditing(false)
    } finally {
      setRenaming(false)
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameConfirm()
    if (e.key === 'Escape') { setEditing(false); setNameInput(racket.name) }
  }

  const statusLabel = { green: 'Good', yellow: 'Watch', red: 'Replace', none: 'No strings' }
  const barColor = { green: 'bg-brand', yellow: 'bg-amber-400', red: 'bg-red-500', none: 'bg-slate-200' }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <StatusDot status={racket.status} size="lg" className="mt-1.5" />
        <div className="flex-1 min-w-0">

          {/* Name row */}
          <div className="flex items-center justify-between gap-2">
            {editing ? (
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  className="flex-1 min-w-0 px-2 py-0.5 text-base font-bold text-ink rounded-lg border border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  onClick={handleRenameConfirm}
                  disabled={renaming || !nameInput.trim()}
                  className="text-xs font-semibold text-brand disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setNameInput(racket.name) }}
                  className="text-xs font-medium text-ink/40"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-ink truncate">{racket.name}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(true); setNameInput(racket.name) }}
                    className="p-1 text-ink/30 hover:text-ink/60 transition-colors"
                    aria-label="Rename racket"
                  >
                    <PencilIcon />
                  </button>
                  <Badge
                    variant={
                      racket.status === 'green' ? 'green'
                      : racket.status === 'yellow' ? 'yellow'
                      : racket.status === 'red' ? 'red'
                      : 'gray'
                    }
                  >
                    {statusLabel[racket.status]}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {job ? (
            <>
              {/* String display — hybrid vs standard */}
              {hybrid ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-ink/60">
                    <span className="font-semibold text-ink/40 mr-1">M</span>
                    {job.mains_brand} {job.mains_model} · {job.mains_gauge}g · {job.mains_tension} lbs
                  </p>
                  <p className="text-xs text-ink/60">
                    <span className="font-semibold text-ink/40 mr-1">X</span>
                    {job.crosses_brand} {job.crosses_model} · {job.crosses_gauge}g · {job.crosses_tension} lbs
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink/70 mt-0.5 font-medium">
                    {job.mains_brand} {job.mains_model}{' '}
                    <span className="text-ink/40 font-normal">· {job.mains_gauge}g</span>
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {job.mains_tension} lbs ·{' '}
                    {new Date(job.date_strung).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </>
              )}

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-ink/60">{racket.totalHours}h played</span>
                  <span className="text-xs text-ink/30">{job.hour_threshold}h limit</span>
                </div>
                <div className="h-[7px] bg-black/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor[racket.status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={onRestring}
                  className="w-full py-2 px-3 text-xs font-semibold text-brand bg-brand-light rounded-lg hover:bg-brand/10 transition-colors"
                >
                  Restring
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-ink/30 mt-0.5">No active strings</p>
              <button
                onClick={onRestring}
                className="mt-3 w-full py-2 px-3 text-xs font-semibold text-brand bg-brand-light rounded-lg hover:bg-brand/10 transition-colors"
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

function HourStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const dec = () => onChange(Math.max(0.5, Math.round((value - 0.5) * 10) / 10))
  const inc = () => onChange(Math.min(8, Math.round((value + 0.5) * 10) / 10))
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={dec} className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand hover:text-brand active:scale-95 transition-all text-lg font-medium">−</button>
      <span className="w-14 text-center text-base font-semibold text-slate-900 tabular-nums">{value}h</span>
      <button type="button" onClick={inc} className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand hover:text-brand active:scale-95 transition-all text-lg font-medium">+</button>
    </div>
  )
}

function SessionBottomSheet({ open, onClose, rackets, onLogged }: {
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
      if (next.has(racketId)) { next.delete(racketId) } else {
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
        setDone(false); setSelectedRackets(new Set()); setHours({}); setDateMode('today')
        onLogged(); onClose()
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log session')
      setLoading(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Session">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">When did you play?</p>
          <div className="flex gap-2">
            {(['today', 'yesterday', 'pick'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setDateMode(mode)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${dateMode === mode ? 'border-ink bg-ink text-white' : 'border-slate-100 text-slate-600 hover:border-slate-300'}`}>
                {mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : 'Pick date'}
              </button>
            ))}
          </div>
          {dateMode === 'pick' && (
            <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} max={TODAY}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" />
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Which rackets?</p>
          {activeRackets.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No rackets with active strings.</p>
          ) : (
            <div className="space-y-2">
              {activeRackets.map((racket) => {
                const selected = selectedRackets.has(racket.id)
                const job = racket.activeJob!
                const stringLine = isHybrid(job)
                  ? `${job.mains_brand} ${job.mains_model} / ${job.crosses_brand} ${job.crosses_model}`
                  : `${job.mains_brand} ${job.mains_model}`
                return (
                  <div key={racket.id} className={`rounded-2xl border-2 overflow-hidden transition-colors ${selected ? 'border-ink' : 'border-slate-100'}`}>
                    <button type="button" onClick={() => toggleRacket(racket.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected ? 'bg-ink' : 'bg-white hover:bg-slate-50'}`}>
                      <StatusDot status={racket.status} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selected ? 'text-white' : 'text-slate-900'}`}>{racket.name}</p>
                        <p className={`text-xs truncate ${selected ? 'text-slate-300' : 'text-slate-500'}`}>{stringLine} · {racket.totalHours}h</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-white border-white' : 'border-slate-300'}`}>
                        {selected && <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                    {selected && (
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <span className="text-sm text-slate-600 font-medium">Hours played</span>
                        <HourStepper value={hours[racket.id] ?? 1} onChange={(v) => setHours((prev) => ({ ...prev, [racket.id]: v }))} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

        <Button type="submit" size="lg" loading={loading} disabled={selectedRackets.size === 0 || done}
          className={`w-full transition-colors ${done ? '!bg-green-500' : ''}`}>
          {done ? '✓ Logged!' : `Log Session${selectedRackets.size > 0 ? ` · ${Array.from(selectedRackets).reduce((sum, id) => sum + (hours[id] ?? 1), 0)}h` : ''}`}
        </Button>
      </form>
    </BottomSheet>
  )
}

export function HomePage({ user, onSignOut }: HomePageProps) {
  const navigate = useNavigate()
  const { rackets, loading, error, refetch, renameRacket } = useRackets()
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false)

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title="String Tracker"
      rightAction={
        <button
          onClick={() => navigate('/rackets/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand bg-brand-light hover:bg-brand/10 transition-colors"
          aria-label="Add racket"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Racket
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-2xl text-red-600 text-sm">{error}</div>
      ) : rackets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M3.5 12c0-2.5 1.5-5 4-6.5M20.5 12c0 2.5-1.5 5-4 6.5" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-ink mb-1">No rackets yet</h2>
          <p className="text-sm text-ink/50 mb-6">Add your first racket to start tracking string life.</p>
          <Button onClick={() => navigate('/rackets/new')}>Add Your First Racket</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rackets.some((r) => r.status === 'red') && (
            <div className="p-3 bg-red-50 rounded-card flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">
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
              onRename={(name) => renameRacket(racket.id, name)}
            />
          ))}
        </div>
      )}

      <FAB onClick={() => setSessionSheetOpen(true)} />
      <SessionBottomSheet open={sessionSheetOpen} onClose={() => setSessionSheetOpen(false)} rackets={rackets} onLogged={refetch} />
    </Layout>
  )
}
