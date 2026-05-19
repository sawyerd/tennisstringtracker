export interface Racket {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface StringJob {
  id: string
  racket_id: string
  user_id: string
  // Mains string
  mains_brand: string
  mains_model: string
  mains_gauge: string
  mains_tension: number
  // Crosses string (null = same as mains / non-hybrid)
  crosses_brand: string | null
  crosses_model: string | null
  crosses_gauge: string | null
  crosses_tension: number | null
  date_strung: string
  hour_threshold: number
  is_active: boolean
  notes: string | null
  retirement_reason: 'broke' | 'cut' | null
  retirement_date: string | null
  cost: number | null
  created_at: string
}

export function isHybrid(job: StringJob): boolean {
  return !!job.crosses_brand
}

export function stringLabel(job: StringJob): string {
  if (isHybrid(job)) {
    return `${job.mains_brand} ${job.mains_model} / ${job.crosses_brand} ${job.crosses_model}`
  }
  return `${job.mains_brand} ${job.mains_model}`
}

export interface Session {
  id: string
  user_id: string
  date: string
  created_at: string
}

export interface SessionRacketEntry {
  id: string
  session_id: string
  string_job_id: string
  racket_id: string
  user_id: string
  hours_played: number
  created_at: string
}

export interface RacketWithJob extends Racket {
  activeJob: StringJob | null
  totalHours: number
  status: 'green' | 'yellow' | 'red' | 'none'
}
