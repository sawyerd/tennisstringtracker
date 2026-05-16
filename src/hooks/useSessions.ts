import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, SessionRacketEntry } from '../types'

export interface SessionWithEntries extends Session {
  entries: SessionRacketEntry[]
}

export function useSessions() {
  const [sessions, setSessions] = useState<SessionWithEntries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false })

      if (sessionsError) throw sessionsError

      const sessionIds = (sessionsData ?? []).map((s) => s.id)

      let entriesMap = new Map<string, SessionRacketEntry[]>()
      if (sessionIds.length > 0) {
        const { data: entriesData, error: entriesError } = await supabase
          .from('session_racket_entries')
          .select('*')
          .in('session_id', sessionIds)

        if (entriesError) throw entriesError

        for (const entry of (entriesData ?? [])) {
          const list = entriesMap.get(entry.session_id) ?? []
          list.push(entry as SessionRacketEntry)
          entriesMap.set(entry.session_id, list)
        }
      }

      const result: SessionWithEntries[] = (sessionsData ?? []).map((s: Session) => ({
        ...s,
        entries: entriesMap.get(s.id) ?? [],
      }))

      setSessions(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const logSession = async (
    date: string,
    entries: Array<{ racket_id: string; string_job_id: string; hours_played: number }>,
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({ date, user_id: user.id })
      .select()
      .single()

    if (sessionError) throw sessionError

    const entryRows = entries.map((e) => ({
      session_id: sessionData.id,
      racket_id: e.racket_id,
      string_job_id: e.string_job_id,
      hours_played: e.hours_played,
      user_id: user.id,
    }))

    const { error: entriesError } = await supabase
      .from('session_racket_entries')
      .insert(entryRows)

    if (entriesError) throw entriesError
    await fetchSessions()
  }

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
    await fetchSessions()
  }

  return { sessions, loading, error, refetch: fetchSessions, logSession, deleteSession }
}
