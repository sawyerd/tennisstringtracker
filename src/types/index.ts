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
  brand: string
  model: string
  gauge: string
  tension_mains: number
  tension_crosses: number | null
  date_strung: string
  hour_threshold: number
  is_active: boolean
  notes: string | null
  retirement_reason: 'broke' | 'cut' | null
  retirement_date: string | null
  cost: number | null
  created_at: string
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
