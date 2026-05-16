import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { useStringJobs } from '../hooks/useStringJobs'
import type { StringJob } from '../types'

interface RetireStringPageProps {
  user: User
  onSignOut: () => void
}

export function RetireStringPage({ user, onSignOut }: RetireStringPageProps) {
  const { id: racketId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getActiveJob, retireStringJob } = useStringJobs(racketId)

  const [activeJob, setActiveJob] = useState<StringJob | null>(null)
  const [fetching, setFetching] = useState(true)
  const [reason, setReason] = useState<'broke' | 'cut' | ''>('')
  const [retirementDate, setRetirementDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!racketId) return
    getActiveJob(racketId)
      .then((job) => setActiveJob(job))
      .catch(() => setError('Failed to load string job'))
      .finally(() => setFetching(false))
  }, [racketId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeJob || !reason) return

    setLoading(true)
    setError(null)

    try {
      await retireStringJob(activeJob.id, reason as 'broke' | 'cut', retirementDate)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retire string job')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Layout user={user} onSignOut={onSignOut} title="Retire Strings" showBack onBack={() => navigate(-1)} showNav={false}>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!activeJob) {
    return (
      <Layout user={user} onSignOut={onSignOut} title="Retire Strings" showBack onBack={() => navigate(-1)} showNav={false}>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-slate-500 text-sm">No active string job found for this racket.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title="Retire Strings"
      showBack
      onBack={() => navigate(-1)}
      showNav={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current string info */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Current Strings
          </h3>
          <p className="text-base font-semibold text-slate-900">
            {activeJob.brand} {activeJob.model}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeJob.gauge}g &middot; {activeJob.tension_mains}
            {activeJob.tension_crosses ? `/${activeJob.tension_crosses}` : ''} lbs
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Strung on {new Date(activeJob.date_strung).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Retirement form */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Retirement <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReason('broke')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                  reason === 'broke'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Broke
              </button>
              <button
                type="button"
                onClick={() => setReason('cut')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                  reason === 'cut'
                    ? 'border-slate-900 bg-slate-50 text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Cut Out
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Retirement Date
            </label>
            <input
              type="date"
              value={retirementDate}
              onChange={(e) => setRetirementDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            />
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
          variant="danger"
          loading={loading}
          disabled={!reason}
          className="w-full"
        >
          Retire These Strings
        </Button>
      </form>
    </Layout>
  )
}
