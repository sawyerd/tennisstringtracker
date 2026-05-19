import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StringJob } from '../types'
import { isHybrid } from '../types'

export interface StringTypeStats {
  label: string
  isHybrid: boolean
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

function jobKey(job: StringJob): string {
  if (isHybrid(job)) {
    return `hybrid||${job.mains_brand}||${job.mains_model}||${job.crosses_brand}||${job.crosses_model}`
  }
  return `${job.mains_brand}||${job.mains_model}||${job.mains_gauge}`
}

function jobLabel(job: StringJob): string {
  if (isHybrid(job)) {
    return `${job.mains_brand} ${job.mains_model} / ${job.crosses_brand} ${job.crosses_model}`
  }
  return `${job.mains_brand} ${job.mains_model} · ${job.mains_gauge}g`
}

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('string_jobs')
        .select('*')
        .order('created_at', { ascending: true })

      if (jobsError) throw jobsError

      const jobs = (jobsData ?? []) as StringJob[]

      const { data: entriesData, error: entriesError } = await supabase
        .from('session_racket_entries')
        .select('string_job_id, racket_id, hours_played')

      if (entriesError) throw entriesError

      const { data: racketsData, error: racketsError } = await supabase
        .from('rackets')
        .select('id, name')

      if (racketsError) throw racketsError

      const racketNames = new Map<string, string>()
      for (const r of (racketsData ?? [])) racketNames.set(r.id, r.name)

      const hoursByJob = new Map<string, number>()
      for (const entry of (entriesData ?? [])) {
        const prev = hoursByJob.get(entry.string_job_id) ?? 0
        hoursByJob.set(entry.string_job_id, prev + Number(entry.hours_played))
      }

      const hoursByRacket = new Map<string, number>()
      for (const entry of (entriesData ?? [])) {
        const prev = hoursByRacket.get(entry.racket_id) ?? 0
        hoursByRacket.set(entry.racket_id, prev + Number(entry.hours_played))
      }

      // Group by string type — hybrid jobs get their own combined key
      const typeMap = new Map<
        string,
        { label: string; hybrid: boolean; totalHours: number; jobCount: number; brokeCount: number; cutCount: number }
      >()
      for (const job of jobs) {
        const key = jobKey(job)
        const hours = hoursByJob.get(job.id) ?? 0
        const existing = typeMap.get(key)
        if (existing) {
          existing.totalHours += hours
          existing.jobCount += 1
          if (job.retirement_reason === 'broke') existing.brokeCount += 1
          if (job.retirement_reason === 'cut') existing.cutCount += 1
        } else {
          typeMap.set(key, {
            label: jobLabel(job),
            hybrid: isHybrid(job),
            totalHours: hours,
            jobCount: 1,
            brokeCount: job.retirement_reason === 'broke' ? 1 : 0,
            cutCount: job.retirement_reason === 'cut' ? 1 : 0,
          })
        }
      }

      const stringTypeStats: StringTypeStats[] = Array.from(typeMap.values())
        .map((s) => ({
          label: s.label,
          isHybrid: s.hybrid,
          avgHours: s.jobCount > 0 ? Math.round((s.totalHours / s.jobCount) * 10) / 10 : 0,
          jobCount: s.jobCount,
          brokeCount: s.brokeCount,
          cutCount: s.cutCount,
        }))
        .sort((a, b) => b.avgHours - a.avgHours)

      const racketHoursStats: RacketHoursStats[] = Array.from(hoursByRacket.entries())
        .map(([racketId, totalHours]) => ({
          racketId,
          racketName: racketNames.get(racketId) ?? 'Unknown',
          totalHours: Math.round(totalHours * 10) / 10,
        }))
        .sort((a, b) => b.totalHours - a.totalHours)

      const broke = jobs.filter((j) => j.retirement_reason === 'broke').length
      const cut = jobs.filter((j) => j.retirement_reason === 'cut').length

      const monthlyMap = new Map<string, number>()
      for (const job of jobs) {
        const month = job.date_strung.slice(0, 7)
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1)
      }
      const monthlyRestrings: MonthlyRestringStats[] = Array.from(monthlyMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))

      setStats({ stringTypeStats, racketHoursStats, brokeVsCut: { broke, cut }, monthlyRestrings })
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
