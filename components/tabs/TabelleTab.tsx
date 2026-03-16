'use client'

import { useGame } from '@/lib/gameState'

export default function TabelleTab() {
  const { state } = useGame()

  const done = state.rounds.filter(
    (r) => r.par && r.entries.some((e) => e.absDelta !== null),
  )

  if (!done.length) {
    return (
      <div className="animate-fadeIn">
        <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
          📊 Scorecard
        </div>
        <div className="text-center py-10 text-muted">
          <span className="text-4xl block mb-2">📊</span>
          Noch keine Runden
        </div>
      </div>
    )
  }

  const rows = state.players
    .map((p, pi) => {
      let sum = 0
      let cnt = 0
      const cells = done.map((r) => {
        const e = r.entries[pi]
        if (!e || e.absDelta === null) return null
        sum += e.absDelta
        cnt++
        return e.absDelta
      })
      return { name: p.name, cells, sum, avg: cnt > 0 ? sum / cnt : null }
    })
    .sort((a, b) => a.sum - b.sum)

  return (
    <div className="animate-fadeIn">
      <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
        📊 Scorecard
      </div>
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full border-collapse text-[0.85rem]" style={{ minWidth: '380px' }}>
          <thead>
            <tr className="border-b-2 border-gold">
              <th className="py-3 px-2 font-bebas text-[0.95rem] tracking-[1.5px] text-gold text-left pl-3">
                Spieler
              </th>
              {done.map((_, i) => (
                <th
                  key={i}
                  className="py-3 px-2 font-bebas text-[0.95rem] tracking-[1.5px] text-gold text-center"
                >
                  R{i + 1}
                </th>
              ))}
              <th className="py-3 px-2 font-bebas text-[0.95rem] tracking-[1.5px] text-gold text-center">
                Σ|Δ|
              </th>
              <th className="py-3 px-2 font-bebas text-[0.95rem] tracking-[1.5px] text-gold text-center">
                Ø|Δ|
              </th>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-2 pl-3 font-mono text-[0.72rem] text-muted">Par</td>
              {done.map((r, i) => (
                <td
                  key={i}
                  className="py-2 px-2 text-center font-mono text-[0.72rem] text-muted"
                >
                  {r.par}g
                </td>
              ))}
              <td />
              <td />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, cells, sum, avg }, rank) => {
              const medal = rank === 0 ? '🥇 ' : rank === 1 ? '🥈 ' : rank === 2 ? '🥉 ' : ''
              return (
                <tr key={name} className="border-b border-border hover:bg-[rgba(240,165,0,0.04)]">
                  <td className="py-3 px-2 pl-3 text-left font-nunito font-bold text-[0.9rem]">
                    {medal}
                    {name}
                  </td>
                  {cells.map((d, i) => {
                    if (d === null)
                      return (
                        <td
                          key={i}
                          className="py-3 px-2 text-center font-mono text-[0.82rem] text-[rgba(237,224,196,0.2)]"
                        >
                          —
                        </td>
                      )
                    const cls =
                      d === 0
                        ? 'text-gold'
                        : d <= 15
                          ? 'text-green'
                          : 'text-red'
                    return (
                      <td
                        key={i}
                        className={`py-3 px-2 text-center font-mono text-[0.82rem] ${cls}`}
                      >
                        {d.toFixed(0)}
                      </td>
                    )
                  })}
                  <td className="py-3 px-2 text-center font-mono font-bold text-[0.95rem] text-gold">
                    {sum > 0 ? sum.toFixed(0) : '—'}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-[0.78rem] text-muted">
                    {avg !== null ? avg.toFixed(1) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
