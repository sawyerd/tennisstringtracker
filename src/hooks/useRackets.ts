import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Racket, RacketWithJob, StringJob } from '../types'

function computeStatus(totalHours: number, threshold: number): 'green' | 'yellow' | 'red' | 'none' {
  if (threshold <= 0) return 'none'
  if (totalHours >= threshold) return 'red'
  if (totalHours >= threshold * 0.8) return 'yellow'
  return 'green'
}

export function useRackets() {
  const [rackets, setRackets] = useState<RacketWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRackets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: racketsData, error: racketsError } = await supabase
        .from('rackets')
        .select('*')
        .order('created_at', { ascending: true })

      if (racketsError) throw racketsError

      const { data: jobsData, error: jobsError } = await supabase
        .from('string_jobs')
        .select('*')
        .eq('is_active', true)

      if (jobsError) throw jobsError

      const activeJobsByRacket = new Map<string, StringJob>()
      for (const job of (jobsData ?? [])) {
        activeJobsByRacket.set(job.racket_id, job as StringJob)
      }

      const activeJobIds = (jobsData ?? []).map((j) => j.id)

      const hoursByJob = new Map<string, number>()
      if (activeJobIds.length > 0) {
        const { data: entriesData, error: entriesError } = await supabase
          .from('session_racket_entries')
          .select('string_job_id, hours_played')
          .in('string_job_id', activeJobIds)

        if (entriesError) throw entriesError

        for (const entry of (entriesData ?? [])) {
          const prev = hoursByJob.get(entry.string_job_id) ?? 0
          hoursByJob.set(entry.string_job_id, prev + Number(entry.hours_played))
        }
      }

      const result: RacketWithJob[] = (racketsData ?? []).map((r: Racket) => {
        const activeJob = activeJobsByRacket.get(r.id) ?? null
        const totalHours = activeJob ? (hoursByJob.get(activeJob.id) ?? 0) : 0
        const status = activeJob
          ? computeStatus(totalHours, activeJob.hour_threshold)
          : 'none'
        return { ...r, activeJob, totalHours, status }
      })

      setRackets(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rackets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRackets()
  }, [fetchRackets])

  const addRacket = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('rackets')
      .insert({ name, user_id: user.id })

    if (error) throw error
    await fetchRackets()
  }

  const deleteRacket = async (id: string) => {
    const { error } = await supabase
      .from('rackets')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchRackets()
  }

  return { rackets, loading, error, refetch: fetchRackets, addRacket, deleteRacket }
}
