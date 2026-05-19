import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { useStringJobs } from '../hooks/useStringJobs'
import type { StringJob } from '../types'

interface StringJobPageProps {
  user: User
  onSignOut: () => void
}

const COMMON_GAUGES = ['15', '15L', '16', '16L', '17', '17L', '18']
const COMMON_BRANDS = ['Babolat', 'Wilson', 'Head', 'Luxilon', 'Tecnifibre', 'Yonex', 'Prince', 'Solinco', 'Volkl', 'Signum Pro']

function StringFields({
  prefix,
  brand, setBrand,
  model, setModel,
  gauge, setGauge,
  tension, setTension,
}: {
  prefix: string
  brand: string; setBrand: (v: string) => void
  model: string; setModel: (v: string) => void
  gauge: string; setGauge: (v: string) => void
  tension: string; setTension: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Brand <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Babolat"
          required
          list={`${prefix}-brand-suggestions`}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <datalist id={`${prefix}-brand-suggestions`}>
          {COMMON_BRANDS.map((b) => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Model <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. RPM Blast"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Gauge</label>
        <select
          value={gauge}
          onChange={(e) => setGauge(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white"
        >
          {COMMON_GAUGES.map((g) => <option key={g} value={g}>{g}g</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tension (lbs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={tension}
          onChange={(e) => setTension(e.target.value)}
          min="30"
          max="80"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>
    </div>
  )
}

export function StringJobPage({ user, onSignOut }: StringJobPageProps) {
  const { id: racketId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getActiveJob, addStringJob, retireStringJob } = useStringJobs(racketId)

  const [existingJob, setExistingJob] = useState<StringJob | null>(null)
  const [fetching, setFetching] = useState(true)

  // Retirement fields
  const [retireReason, setRetireReason] = useState<'broke' | 'cut' | ''>('')
  const [retireDate, setRetireDate] = useState(new Date().toISOString().split('T')[0])

  // Hybrid toggle
  const [hybrid, setHybrid] = useState(false)

  // Mains fields
  const [mainsBrand, setMainsBrand] = useState('')
  const [mainsModel, setMainsModel] = useState('')
  const [mainsGauge, setMainsGauge] = useState('16')
  const [mainsTension, setMainsTension] = useState('55')

  // Crosses fields
  const [crossesBrand, setCrossesBrand] = useState('')
  const [crossesModel, setCrossesModel] = useState('')
  const [crossesGauge, setCrossesGauge] = useState('16')
  const [crossesTension, setCrossesTension] = useState('55')

  // Shared fields
  const [dateStrung, setDateStrung] = useState(new Date().toISOString().split('T')[0])
  const [hourThreshold, setHourThreshold] = useState('10')
  const [notes, setNotes] = useState('')
  const [cost, setCost] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!racketId) return
    getActiveJob(racketId)
      .then((job) => setExistingJob(job))
      .catch(() => setError('Failed to check existing strings'))
      .finally(() => setFetching(false))
  }, [racketId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill crosses from mains when toggling hybrid on
  const toggleHybrid = (on: boolean) => {
    if (on) {
      setCrossesBrand(mainsBrand)
      setCrossesModel(mainsModel)
      setCrossesGauge(mainsGauge)
      setCrossesTension(mainsTension)
    }
    setHybrid(on)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!racketId) return

    setLoading(true)
    setError(null)

    try {
      if (existingJob) {
        if (!retireReason) {
          setError('Please select a retirement reason')
          setLoading(false)
          return
        }
        await retireStringJob(existingJob.id, retireReason as 'broke' | 'cut', retireDate)
      }

      await addStringJob({
        racket_id: racketId,
        mains_brand: mainsBrand.trim(),
        mains_model: mainsModel.trim(),
        mains_gauge: mainsGauge,
        mains_tension: parseInt(mainsTension, 10),
        crosses_brand: hybrid ? crossesBrand.trim() || null : null,
        crosses_model: hybrid ? crossesModel.trim() || null : null,
        crosses_gauge: hybrid ? crossesGauge || null : null,
        crosses_tension: hybrid ? (parseInt(crossesTension, 10) || null) : null,
        date_strung: dateStrung,
        hour_threshold: parseFloat(hourThreshold),
        notes: notes.trim() || null,
        cost: cost ? parseFloat(cost) : null,
      })

      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save string job')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Layout user={user} onSignOut={onSignOut} title="New String Job" showBack onBack={() => navigate(-1)} showNav={false}>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title={existingJob ? 'Restring Racket' : 'New String Job'}
      showBack
      onBack={() => navigate(-1)}
      showNav={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Retirement step */}
        {existingJob && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-0.5">Retire Current Strings</h3>
              <p className="text-xs text-amber-700">
                {existingJob.mains_brand} {existingJob.mains_model} &middot; {existingJob.mains_gauge}g
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-800 mb-2">
                Retirement Reason <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRetireReason('broke')}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    retireReason === 'broke'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-amber-200 bg-white text-amber-800 hover:border-amber-300'
                  }`}
                >
                  Broke
                </button>
                <button
                  type="button"
                  onClick={() => setRetireReason('cut')}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    retireReason === 'cut'
                      ? 'border-ink bg-slate-50 text-ink'
                      : 'border-amber-200 bg-white text-amber-800 hover:border-amber-300'
                  }`}
                >
                  Cut Out
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5">Date Retired</label>
              <input
                type="date"
                value={retireDate}
                onChange={(e) => setRetireDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* New string job */}
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New String Job</h3>
            {/* Hybrid toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-medium text-slate-600">Hybrid</span>
              <button
                type="button"
                role="switch"
                aria-checked={hybrid}
                onClick={() => toggleHybrid(!hybrid)}
                className={`relative w-9 h-5 rounded-full transition-colors ${hybrid ? 'bg-brand' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hybrid ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
            </label>
          </div>

          {/* Mains — always shown */}
          {hybrid && (
            <p className="text-xs font-semibold text-brand uppercase tracking-wider -mb-1">Mains</p>
          )}
          <StringFields
            prefix="mains"
            brand={mainsBrand} setBrand={setMainsBrand}
            model={mainsModel} setModel={setMainsModel}
            gauge={mainsGauge} setGauge={setMainsGauge}
            tension={mainsTension} setTension={setMainsTension}
          />

          {/* Crosses — only when hybrid */}
          {hybrid && (
            <>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-3">Crosses</p>
                <StringFields
                  prefix="crosses"
                  brand={crossesBrand} setBrand={setCrossesBrand}
                  model={crossesModel} setModel={setCrossesModel}
                  gauge={crossesGauge} setGauge={setCrossesGauge}
                  tension={crossesTension} setTension={setCrossesTension}
                />
              </div>
            </>
          )}

          {/* Shared fields */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date Strung <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateStrung}
                onChange={(e) => setDateStrung(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hour Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={hourThreshold}
                onChange={(e) => setHourThreshold(e.target.value)}
                min="1"
                max="100"
                step="0.5"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost ($, optional)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes about this string job..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={existingJob !== null && retireReason === ''}
          className="w-full"
        >
          {existingJob ? 'Retire & Restring' : 'Save String Job'}
        </Button>
      </form>
    </Layout>
  )
}
