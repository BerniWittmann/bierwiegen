'use client'

import { useGame } from '@/lib/gameState'
import { remainingBefore } from '@/lib/gameLogic'

export default function RanglisteTab() {
  const { state } = useGame()

  const done = state.rounds.filter(
    (r) => r.par && r.entries.some((e) => e.absDelta !== null),
  )

  if (!done.length) {
    return (
      <div className="animate-fadeIn">
        <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
          🏆 Rangliste
        </div>
        <div className="text-center py-10 text-muted">
          <span className="text-4xl block mb-2">🍺</span>
          Noch keine Runden gespielt
        </div>
      </div>
    )
  }

  const ri = state.rounds.length - 1

  const rows = state.players
    .map((p, pi) => {
      let sum = 0
      let cnt = 0
      let best = Infinity
      done.forEach((r) => {
        const e = r.entries[pi]
        if (e && e.absDelta != null) {
          sum += e.absDelta
          cnt++
          if (e.absDelta < best) best = e.absDelta
        }
      })
      const rem = remainingBefore(state, pi, ri + 1)
      return {
        name: p.name,
        sum,
        cnt,
        avg: cnt > 0 ? sum / cnt : null,
        best: best === Infinity ? null : best,
        rem,
      }
    })
    .sort((a, b) => a.sum - b.sum)

  return (
    <div className="animate-fadeIn">
      <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
        🏆 Rangliste
      </div>
      <div className="flex flex-col gap-3">
        {rows.map(({ name, sum, cnt, best, rem }, rank) => (
          <div
            key={name}
            className="flex items-center gap-4 bg-surface border border-border rounded-[14px] px-5 py-4 transition-transform hover:translate-x-1"
          >
            <div
              className={`font-bebas text-[2rem] text-gold w-9 text-center ${rank < 3 ? 'opacity-100' : 'opacity-50'}`}
            >
              {rank + 1}
            </div>
            <div className="flex-1">
              <div className="font-nunito font-extrabold text-base">
                {rank === 0 ? '🥇 ' : ''}
                {name}
              </div>
              <div className="text-[0.72rem] text-muted mt-0.5 font-mono">
                {cnt} Runden · Best |Δ|: {best !== null ? best.toFixed(0) + 'g' : '—'} ·{' '}
                {rem > 0 ? rem.toFixed(0) + 'g übrig' : 'Bier leer 🍺'}
              </div>
            </div>
            <div
              className={`font-bebas text-[2rem] tracking-[1px] ${rank === 0 ? 'text-green' : 'text-gold'}`}
            >
              {cnt > 0 ? sum.toFixed(0) + 'g' : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
