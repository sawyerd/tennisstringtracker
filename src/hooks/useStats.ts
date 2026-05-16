import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StringJob } from '../types'

export interface StringTypeStats {
  brand: string
  model: string
  gauge: string
  avgHours: number
  jobCount: number
  brokeCount: number
  cutCount: number
}

export interface RacketHoursStats {
  racketId: string
  racketName: string
  totalHours: number
}

export interface MonthlyRestringStats {
  month: string
  count: number
}

export interface StatsData {
  stringTypeStats: StringTypeStats[]
  racketHoursStats: RacketHoursStats[]
  brokeVsCut: { broke: number; cut: number }
  monthlyRestrings: MonthlyRestringStats[]
}

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all string jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('string_jobs')
        .select('*')
        .order('created_at', { ascending: true })

      if (jobsError) throw jobsError

      const jobs = (jobsData ?? []) as StringJob[]

      // Fetch all session entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('session_racket_entries')
        .select('string_job_id, racket_id, hours_played')

      if (entriesError) throw entriesError

      // Fetch all rackets for names
      const { data: racketsData, error: racketsError } = await supabase
        .from('rackets')
        .select('id, name')

      if (racketsError) throw racketsError

      const racketNames = new Map<string, string>()
      for (const r of (racketsData ?? [])) {
        racketNames.set(r.id, r.name)
      }

      // Hours per string job
      const hoursByJob = new Map<string, number>()
      for (const entry of (entriesData ?? [])) {
        const prev = hoursByJob.get(entry.string_job_id) ?? 0
        hoursByJob.set(entry.string_job_id, prev + Number(entry.hours_played))
      }

      // Hours per racket (across all jobs)
      const hoursByRacket = new Map<string, number>()
      for (const entry of (entriesData ?? [])) {
        const prev = hoursByRacket.get(entry.racket_id) ?? 0
        hoursByRacket.set(entry.racket_id, prev + Number(entry.hours_played))
      }

      // String type stats
      const typeMap = new Map<
        string,
        { brand: string; model: string; gauge: string; totalHours: number; jobCount: number; brokeCount: number; cutCount: number }
      >()
      for (const job of jobs) {
        const key = `${job.brand}||${job.model}||${job.gauge}`
        const hours = hoursByJob.get(job.id) ?? 0
        const existing = typeMap.get(key)
        if (existing) {
          existing.totalHours += hours
          existing.jobCount += 1
          if (job.retirement_reason === 'broke') existing.brokeCount += 1
          if (job.retirement_reason === 'cut') existing.cutCount += 1
        } else {
          typeMap.set(key, {
            brand: job.brand,
            model: job.model,
            gauge: job.gauge,
            totalHours: hours,
            jobCount: 1,
            brokeCount: job.retirement_reason === 'broke' ? 1 : 0,
            cutCount: job.retirement_reason === 'cut' ? 1 : 0,
          })
        }
      }

      const stringTypeStats: StringTypeStats[] = Array.from(typeMap.values())
        .map((s) => ({
          brand: s.brand,
          model: s.model,
          gauge: s.gauge,
          avgHours: s.jobCount > 0 ? Math.round((s.totalHours / s.jobCount) * 10) / 10 : 0,
          jobCount: s.jobCount,
          brokeCount: s.brokeCount,
          cutCount: s.cutCount,
        }))
        .sort((a, b) => b.avgHours - a.avgHours)

      // Racket hours stats
      const racketHoursStats: RacketHoursStats[] = Array.from(hoursByRacket.entries())
        .map(([racketId, totalHours]) => ({
          racketId,
          racketName: racketNames.get(racketId) ?? 'Unknown',
          totalHours: Math.round(totalHours * 10) / 10,
        }))
        .sort((a, b) => b.totalHours - a.totalHours)

      // Broke vs cut overall
      const broke = jobs.filter((j) => j.retirement_reason === 'broke').length
      const cut = jobs.filter((j) => j.retirement_reason === 'cut').length

      // Monthly restrings (new string jobs per month)
      const monthlyMap = new Map<string, number>()
      for (const job of jobs) {
        const month = job.date_strung.slice(0, 7) // YYYY-MM
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1)
      }
      const monthlyRestrings: MonthlyRestringStats[] = Array.from(monthlyMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))

      setStats({
        stringTypeStats,
        racketHoursStats,
        brokeVsCut: { broke, cut },
        monthlyRestrings,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
