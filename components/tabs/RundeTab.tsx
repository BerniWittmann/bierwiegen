'use client'

import { useState } from 'react'
import { useGame } from '@/lib/gameState'
import { curRound, curRoundIdx, remainingBefore } from '@/lib/gameLogic'

function BtnGold({
  onClick,
  children,
  className = '',
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 bg-gold text-bg rounded-[10px] font-nunito font-extrabold text-[0.82rem] uppercase tracking-[0.5px] cursor-pointer border-none hover:bg-amber hover:-translate-y-px transition-all ${className}`}
    >
      {children}
    </button>
  )
}

export default function RundeTab() {
  const { state, updateState, showToast, setActiveTab } = useGame()
  const [parInput, setParInput] = useState('')

  if (!state.gameStarted) {
    return (
      <div className="text-center py-10 text-muted animate-fadeIn">
        <span className="text-4xl block mb-2">⚙️</span>
        Erst Setup abschließen und Spiel starten
      </div>
    )
  }

  if (state.gameOver) {
    return (
      <div className="text-center py-10 animate-fadeIn">
        <span className="text-6xl block mb-4">🏆</span>
        <h2 className="font-bebas text-5xl text-gold tracking-[3px]">Spiel beendet!</h2>
        <p className="text-muted mt-2 mb-6">Alle Biere sind leer — Prost! 🍺</p>
        <BtnGold onClick={() => setActiveTab('rangliste')}>Rangliste anzeigen →</BtnGold>
      </div>
    )
  }

  const ri = curRoundIdx(state)
  const round = curRound(state)
  if (!round) return null

  const getParHint = (): { text: string; type: 'ok' | 'warn' | 'info' } => {
    if (ri === 0) return { text: 'Runde 1 – frei wählbar', type: 'info' }
    const prevRound = state.rounds[ri - 1]
    if (!prevRound) return { text: '', type: 'info' }
    const endWeights = prevRound.entries
      .map((e) => e.weight)
      .filter((w): w is number => w !== null)
    if (!endWeights.length)
      return { text: 'Noch keine Endgewichte der letzten Runde', type: 'info' }
    const minEnd = Math.min(...endWeights)
    const val = parseFloat(parInput)
    if (isNaN(val))
      return {
        text: `Empfehlung: unter ${minEnd}g (geringstes Endgewicht letzte Runde)`,
        type: 'info',
      }
    if (val < minEnd) return { text: `✓ Gültig – unter ${minEnd}g`, type: 'ok' }
    return { text: `⚠ Zu hoch! Sollte unter ${minEnd}g liegen`, type: 'warn' }
  }

  const setPar = () => {
    const val = parseFloat(parInput)
    if (isNaN(val) || val <= 0) return showToast('Bitte gültiges Par eingeben!')
    updateState((prev) => {
      const rounds = [...prev.rounds]
      rounds[rounds.length - 1] = { ...rounds[rounds.length - 1], par: val }
      return { ...prev, rounds }
    })
    setParInput('')
    showToast(`Par: ${val}g ✓`)
  }

  const onWeightInput = (pi: number, value: string) => {
    const w = parseFloat(value)
    const rem = remainingBefore(state, pi, ri)
    updateState((prev) => {
      const rounds = [...prev.rounds]
      const lastIdx = rounds.length - 1
      const r = { ...rounds[lastIdx], entries: [...rounds[lastIdx].entries] }
      if (isNaN(w)) {
        r.entries[pi] = { weight: null, drunk: null, absDelta: null }
      } else {
        const drunk = Math.max(0, rem - w)
        const absDelta = Math.abs(w - (r.par ?? 0))
        r.entries[pi] = { weight: w, drunk, absDelta }
      }
      rounds[lastIdx] = r
      return { ...prev, rounds }
    })
  }

  const finishRound = () => {
    if (!round.par) return showToast('Bitte erst Par setzen!')
    const missing = state.players.filter((_, pi) => {
      const rem = remainingBefore(state, pi, ri)
      return rem > 0 && round.entries[pi].weight === null
    })
    if (missing.length)
      return showToast('Fehlt noch: ' + missing.map((p) => p.name).join(', '))

    // Fix zero-weight entries
    const fixedEntries = round.entries.map((e, pi) => {
      if (e.weight !== null && e.weight <= 0) {
        return {
          weight: 0,
          drunk: remainingBefore(state, pi, ri),
          absDelta: Math.abs(0 - (round.par ?? 0)),
        }
      }
      return e
    })

    const allEmpty = state.players.every((_, pi) => {
      const rem = remainingBefore(state, pi, ri)
      if (rem <= 0) return true
      const drunk = fixedEntries[pi].drunk ?? 0
      return rem - drunk <= 0
    })

    if (allEmpty) {
      updateState((prev) => {
        const rounds = [...prev.rounds]
        rounds[rounds.length - 1] = { ...rounds[rounds.length - 1], entries: fixedEntries }
        return { ...prev, rounds, gameOver: true }
      })
      showToast('🍺 Alle Biere leer – Spiel vorbei!')
      return
    }

    // Find next caller: smallest |delta| among active players
    let bestDelta = Infinity
    let callerIdx = 0
    state.players.forEach((_, pi) => {
      const rem = remainingBefore(state, pi, ri)
      if (rem <= 0) return
      const d = round.entries[pi].absDelta
      if (d !== null && d < bestDelta) {
        bestDelta = d
        callerIdx = pi
      }
    })

    const endWeights = round.entries
      .map((e) => e.weight)
      .filter((w): w is number => w !== null && w > 0)
    const minEnd = endWeights.length ? Math.min(...endWeights) : null

    updateState((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          par: null,
          caller: prev.players[callerIdx].name,
          suggestedMaxPar: minEnd ? minEnd - 1 : null,
          entries: prev.players.map(() => ({ weight: null, drunk: null, absDelta: null })),
        },
      ],
    }))
    setParInput('')
    showToast(
      `Runde ${state.rounds.length + 1} — ${state.players[callerIdx].name} sagt das Par an!`,
    )
  }

  const endGameEarly = () => {
    if (!confirm('Spiel wirklich beenden? Die aktuelle Runde wird abgebrochen.')) return
    updateState((prev) => {
      const rounds = [...prev.rounds]
      const lastRound = rounds[rounds.length - 1]
      const hasAnyEntry = lastRound?.entries.some((e) => e.absDelta !== null)
      if (!hasAnyEntry && rounds.length > 1) rounds.pop()
      return { ...prev, rounds, gameOver: true }
    })
    showToast('🍺 Spiel beendet – Prost!')
    setTimeout(() => setActiveTab('rangliste'), 800)
  }

  const parHint = getParHint()

  return (
    <div className="animate-fadeIn">
      {/* Round header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="text-[0.72rem] tracking-[2px] uppercase text-muted mb-1">Runde</div>
          <div
            className="font-bebas text-[3.5rem] leading-none text-gold"
            style={{ filter: 'drop-shadow(0 0 20px rgba(240,165,0,.3))' }}
          >
            {ri + 1}
          </div>
        </div>
        <div className="flex flex-col gap-1 pt-2">
          <div>
            <span className="text-[0.7rem] tracking-[2px] uppercase text-muted mr-2">Par</span>
            <span className="font-mono text-base text-gold">
              {round.par ? round.par + 'g' : '?'}
            </span>
          </div>
          <div>
            <span className="text-[0.7rem] tracking-[2px] uppercase text-muted mr-2">
              Angesagt von
            </span>
            <span className="font-mono text-base">{round.caller || '—'}</span>
          </div>
        </div>
      </div>

      {/* Par setter */}
      {!round.par && (
        <div
          className="bg-bg2 rounded-xl p-5 mb-5"
          style={{ border: '1px solid #f0a500' }}
        >
          <div className="text-[0.72rem] tracking-[1.5px] uppercase text-muted mb-1">
            📣 Par-Ansage
          </div>
          <div className="font-nunito font-extrabold text-[1.1rem] text-gold mb-3">
            {round.caller || '—'}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={parInput}
              onChange={(e) => setParInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setPar()}
              placeholder="Par in g..."
              className="flex-1 !mb-0 !text-[1.3rem] !text-center"
            />
            <BtnGold onClick={setPar} className="!py-2 !text-[0.75rem]">
              ✓ Setzen
            </BtnGold>
          </div>
          <div
            className={`text-[0.75rem] mt-2 leading-relaxed ${
              parHint.type === 'ok'
                ? 'text-green'
                : parHint.type === 'warn'
                  ? 'text-amber'
                  : 'text-muted'
            }`}
          >
            {parHint.text || 'Bitte Par eingeben'}
          </div>
        </div>
      )}

      {/* Entry cards */}
      <div className="flex flex-col gap-3">
        {state.players.map((p, pi) => {
          const e = round.entries[pi]
          const rem = remainingBefore(state, pi, ri)
          const isEmpty = rem <= 0
          const isDone = !isEmpty && e.weight !== null

          // Delta pill
          let deltaCls = ''
          let deltaLabel = '—'
          if (isDone && e.absDelta !== null) {
            const d = e.absDelta
            deltaLabel = `|${d.toFixed(0)}|g`
            deltaCls =
              d === 0
                ? 'bg-[rgba(240,165,0,0.15)] text-gold border border-[rgba(240,165,0,0.3)]'
                : d <= 15
                  ? 'bg-[rgba(86,194,113,0.15)] text-green border border-[rgba(86,194,113,0.25)]'
                  : 'bg-[rgba(240,90,90,0.12)] text-red border border-[rgba(240,90,90,0.2)]'
          }

          // Target hint
          let targetHint: { type: 'warn' | 'normal'; text: string } | null = null
          if (!isEmpty && round.par && !isDone) {
            const targetEnd = rem - round.par
            if (targetEnd <= 0) {
              targetHint = {
                type: 'warn',
                text: `⚠ Bier reicht nicht für das Par (${rem}g übrig)`,
              }
            } else {
              targetHint = {
                type: 'normal',
                text: `→ Bis ${targetEnd.toFixed(0)}g trinken (${round.par}g trinken)`,
              }
            }
          }

          return (
            <div
              key={pi}
              className={`bg-bg2 rounded-[14px] p-4 transition-colors ${
                isDone
                  ? 'border border-[rgba(86,194,113,0.4)]'
                  : isEmpty
                    ? 'border border-[rgba(240,90,90,0.35)] opacity-70'
                    : 'border border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-nunito font-extrabold text-base flex-1">{p.name}</span>
                <span className="font-mono text-[0.75rem] bg-surface2 rounded px-2 py-1 text-muted">
                  Start: {p.startWeight}g
                </span>
                {isEmpty ? (
                  <span className="font-mono text-[0.75rem] bg-surface2 rounded px-2 py-1 text-red">
                    🍺 Leer
                  </span>
                ) : (
                  <span className="font-mono text-[0.75rem] bg-surface2 rounded px-2 py-1 text-blue">
                    {rem}g übrig
                  </span>
                )}
              </div>

              {isEmpty ? (
                <div className="text-muted text-[0.82rem] pt-1">
                  Kein Bier mehr – überspringen
                </div>
              ) : (
                <>
                  {targetHint && (
                    <div
                      className={`text-[0.8rem] rounded-[7px] px-3 py-2 mb-3 ${
                        targetHint.type === 'warn'
                          ? 'text-amber border border-[rgba(255,140,0,0.2)]'
                          : 'text-gold border border-[rgba(240,165,0,0.18)]'
                      }`}
                      style={{
                        background:
                          targetHint.type === 'warn'
                            ? 'rgba(255,140,0,0.08)'
                            : 'rgba(240,165,0,0.08)',
                      }}
                    >
                      {targetHint.text}
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                    <div>
                      <label className="block text-[0.7rem] tracking-[1.5px] uppercase text-muted mb-1">
                        Endgewicht (g)
                      </label>
                      <input
                        key={`w_${ri}_${pi}`}
                        type="number"
                        defaultValue={e.weight !== null ? e.weight : undefined}
                        onChange={(ev) => onWeightInput(pi, ev.target.value)}
                        placeholder={round.par ? round.par + 'g' : '?g'}
                        disabled={!round.par}
                        className="!mb-0 !text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] tracking-[1.5px] uppercase text-muted mb-1">
                        Getrunken (g)
                      </label>
                      <input
                        key={`drunk_${ri}_${pi}`}
                        type="number"
                        value={e.drunk !== null ? e.drunk.toFixed(0) : ''}
                        readOnly
                        placeholder="—"
                        className="!mb-0 !text-center !text-blue cursor-default"
                        onChange={() => {}}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[0.7rem] tracking-[1.5px] uppercase text-muted mb-1">
                        |Δ| zum Par
                      </label>
                      <div
                        className={`flex items-center justify-center font-mono font-medium text-base rounded-lg min-h-[43px] bg-surface2 ${deltaCls}`}
                      >
                        {deltaLabel}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5">
        <BtnGold onClick={finishRound} className="w-full justify-center">
          Runde abschließen →
        </BtnGold>
      </div>
      <div className="mt-2">
        <button
          onClick={endGameEarly}
          className="w-full px-5 py-3 rounded-[10px] font-nunito font-extrabold text-[0.82rem] uppercase tracking-[0.5px] cursor-pointer border transition-all text-red hover:opacity-80"
          style={{
            background: 'rgba(240,90,90,0.15)',
            borderColor: 'rgba(240,90,90,0.4)',
          }}
        >
          🛑 Spiel beenden
        </button>
      </div>
    </div>
  )
}
