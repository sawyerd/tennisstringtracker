import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StringJob } from '../types'

export function useStringJobs(racketId?: string) {
  const [jobs, setJobs] = useState<StringJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    if (!racketId) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('string_jobs')
        .select('*')
        .eq('racket_id', racketId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setJobs((data ?? []) as StringJob[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load string jobs')
    } finally {
      setLoading(false)
    }
  }, [racketId])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const addStringJob = async (job: {
    racket_id: string
    mains_brand: string
    mains_model: string
    mains_gauge: string
    mains_tension: number
    crosses_brand: string | null
    crosses_model: string | null
    crosses_gauge: string | null
    crosses_tension: number | null
    date_strung: string
    hour_threshold: number
    notes: string | null
    cost: number | null
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: existingJobs } = await supabase
      .from('string_jobs')
      .select('id')
      .eq('racket_id', job.racket_id)
      .eq('is_active', true)

    if (existingJobs && existingJobs.length > 0) {
      throw new Error('Racket already has an active string job. Retire it first.')
    }

    const { error } = await supabase
      .from('string_jobs')
      .insert({ ...job, user_id: user.id, is_active: true })

    if (error) throw error
    await fetchJobs()
  }

  const retireStringJob = async (
    jobId: string,
    reason: 'broke' | 'cut',
    retirementDate: string,
  ) => {
    const { error } = await supabase
      .from('string_jobs')
      .update({ is_active: false, retirement_reason: reason, retirement_date: retirementDate })
      .eq('id', jobId)

    if (error) throw error
    await fetchJobs()
  }

  const getActiveJob = async (racketId: string): Promise<StringJob | null> => {
    const { data, error } = await supabase
      .from('string_jobs')
      .select('*')
      .eq('racket_id', racketId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data as StringJob | null
  }

  return { jobs, loading, error, refetch: fetchJobs, addStringJob, retireStringJob, getActiveJob }
}
