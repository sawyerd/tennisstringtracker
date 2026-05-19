import type { User } from '@supabase/supabase-js'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useStats } from '../hooks/useStats'

interface StatsPageProps {
  user: User
  onSignOut: () => void
}

function formatMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function StatsPage({ user, onSignOut }: StatsPageProps) {
  const { stats, loading, error } = useStats()

  if (loading) {
    return (
      <Layout user={user} onSignOut={onSignOut} title="Stats">
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout user={user} onSignOut={onSignOut} title="Stats">
        <div className="p-4 bg-red-50 rounded-2xl text-red-600 text-sm">{error}</div>
      </Layout>
    )
  }

  if (!stats) return null

  const maxHours = Math.max(...stats.racketHoursStats.map((r) => r.totalHours), 1)
  const totalRetired = stats.brokeVsCut.broke + stats.brokeVsCut.cut
  const maxMonthCount = Math.max(...stats.monthlyRestrings.map((m) => m.count), 1)

  return (
    <Layout user={user} onSignOut={onSignOut} title="Stats">
      <div className="space-y-4">

        {/* String type performance */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Avg Hours by String</h2>
          {stats.stringTypeStats.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No data yet. Start tracking sessions.</p>
          ) : (
            <div className="space-y-3">
              {stats.stringTypeStats.map((s, i) => (
                <div key={`${s.label}-${i}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.isHybrid && <Badge variant="default">Hybrid</Badge>}
                        <Badge variant="gray">{s.jobCount} job{s.jobCount !== 1 ? 's' : ''}</Badge>
                        {s.brokeCount > 0 && <Badge variant="red">{s.brokeCount} broke</Badge>}
                        {s.cutCount > 0 && <Badge variant="default">{s.cutCount} cut</Badge>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 ml-2 flex-shrink-0">
                      {s.avgHours}h avg
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min(100, (s.avgHours / 30) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Hours per racket */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Hours per Racket</h2>
          {stats.racketHoursStats.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No session data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.racketHoursStats.map((r) => (
                <div key={r.racketId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 truncate flex-1">{r.racketName}</span>
                    <span className="text-sm font-semibold text-slate-900 ml-2 flex-shrink-0">
                      {r.totalHours}h
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded-full"
                      style={{ width: `${(r.totalHours / maxHours) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Broke vs Cut */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">String Retirement Reasons</h2>
          {totalRetired === 0 ? (
            <p className="text-sm text-slate-500 py-2">No retired strings yet.</p>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">{stats.brokeVsCut.broke}</p>
                  <p className="text-xs text-red-500 mt-0.5">Broke</p>
                </div>
                <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-700">{stats.brokeVsCut.cut}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Cut Out</p>
                </div>
              </div>

              {/* Bar visualization */}
              {totalRetired > 0 && (
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  <div
                    className="bg-red-400 transition-all"
                    style={{ width: `${(stats.brokeVsCut.broke / totalRetired) * 100}%` }}
                  />
                  <div
                    className="bg-slate-300 transition-all"
                    style={{ width: `${(stats.brokeVsCut.cut / totalRetired) * 100}%` }}
                  />
                </div>
              )}

              {/* By string type */}
              {stats.stringTypeStats.filter((s) => s.brokeCount + s.cutCount > 0).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">By String</h3>
                  {stats.stringTypeStats
                    .filter((s) => s.brokeCount + s.cutCount > 0)
                    .map((s, i) => (
                      <div key={`${s.label}-${i}`} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 truncate flex-1">
                          {s.label}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {s.brokeCount > 0 && (
                            <span className="text-red-500">{s.brokeCount} broke</span>
                          )}
                          {s.cutCount > 0 && (
                            <span className="text-slate-500">{s.cutCount} cut</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Restring frequency */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Restring Frequency</h2>
          {stats.monthlyRestrings.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No string jobs recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {[...stats.monthlyRestrings].reverse().map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">{formatMonth(m.month)}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full"
                        style={{ width: `${(m.count / maxMonthCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-6 text-right">{m.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </Layout>
  )
}
