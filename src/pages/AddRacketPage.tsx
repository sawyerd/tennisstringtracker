import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { useRackets } from '../hooks/useRackets'

interface AddRacketPageProps {
  user: User
  onSignOut: () => void
}

export function AddRacketPage({ user, onSignOut }: AddRacketPageProps) {
  const navigate = useNavigate()
  const { addRacket } = useRackets()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await addRacket(name.trim())
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add racket')
      setLoading(false)
    }
  }

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      title="Add Racket"
      showBack
      onBack={() => navigate('/')}
      showNav={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Racket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wilson Pro Staff 97"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Use a descriptive name like brand + model + grip size.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Add Racket
        </Button>
      </form>
    </Layout>
  )
}
