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

export function StringJobPage({ user, onSignOut }: StringJobPageProps) {
  const { id: racketId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getActiveJob, addStringJob, retireStringJob } = useStringJobs(racketId)

  const [existingJob, setExistingJob] = useState<StringJob | null>(null)
  const [fetching, setFetching] = useState(true)

  // Retirement step (shown if existing job)
  const [showRetireStep, setShowRetireStep] = useState(false)
  const [retireReason, setRetireReason] = useState<'broke' | 'cut' | ''>('')
  const [retireDate, setRetireDate] = useState(new Date().toISOString().split('T')[0])

  // New string job form
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [gauge, setGauge] = useState('16')
  const [tensionMains, setTensionMains] = useState('55')
  const [tensionCrosses, setTensionCrosses] = useState('')
  const [dateStrung, setDateStrung] = useState(new Date().toISOString().split('T')[0])
  const [hourThreshold, setHourThreshold] = useState('10')
  const [notes, setNotes] = useState('')
  const [cost, setCost] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!racketId) return
    getActiveJob(racketId)
      .then((job) => {
        setExistingJob(job)
        if (job) setShowRetireStep(true)
      })
      .catch(() => setError('Failed to check existing strings'))
      .finally(() => setFetching(false))
  }, [racketId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!racketId) return

    setLoading(true)
    setError(null)

    try {
      // If there's an existing job, retire it first
      if (existingJob && showRetireStep) {
        if (!retireReason) {
          setError('Please select a retirement reason')
          setLoading(false)
          return
        }
        await retireStringJob(existingJob.id, retireReason as 'broke' | 'cut', retireDate)
      }

      await addStringJob({
        racket_id: racketId,
        brand: brand.trim(),
        model: model.trim(),
        gauge,
        tension_mains: parseInt(tensionMains, 10),
        tension_crosses: tensionCrosses ? parseInt(tensionCrosses, 10) : null,
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
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
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
        {/* Retirement step if existing job */}
        {existingJob && showRetireStep && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-0.5">Retire Current Strings</h3>
              <p className="text-xs text-amber-700">
                {existingJob.brand} {existingJob.model} &middot; {existingJob.gauge}
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
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-amber-200 bg-white text-amber-800 hover:border-amber-300'
                  }`}
                >
                  Cut Out
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5">
                Date Retired
              </label>
              <input
                type="date"
                value={retireDate}
                onChange={(e) => setRetireDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* New string job form */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            New String Job
          </h3>

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
                list="brand-suggestions"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
              <datalist id="brand-suggestions">
                {COMMON_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gauge <span className="text-red-500">*</span>
              </label>
              <select
                value={gauge}
                onChange={(e) => setGauge(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
              >
                {COMMON_GAUGES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hour Threshold <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={hourThreshold}
                onChange={(e) => setHourThreshold(e.target.value)}
                min="1"
                max="100"
                step="0.5"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mains Tension (lbs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={tensionMains}
                onChange={(e) => setTensionMains(e.target.value)}
                min="30"
                max="80"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Crosses Tension (optional)
              </label>
              <input
                type="number"
                value={tensionCrosses}
                onChange={(e) => setTensionCrosses(e.target.value)}
                min="30"
                max="80"
                placeholder="Same"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cost ($, optional)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes about this string job..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
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
          disabled={existingJob !== null && retireReason === ''}
          className="w-full"
        >
          {existingJob ? 'Retire & Restring' : 'Save String Job'}
        </Button>
      </form>
    </Layout>
  )
}
