'use client'

import { useState } from 'react'
import { useGame } from '@/lib/gameState'

function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="font-bebas text-[1.6rem] tracking-[2px] text-gold">
            ⛳ Spielanleitung
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 px-3 py-1 bg-transparent border border-border text-muted rounded-[10px] font-nunito font-extrabold text-[0.82rem] cursor-pointer hover:border-gold hover:text-gold transition-all"
          >
            ✕
          </button>
        </div>
        <div className="text-muted text-[0.78rem] font-nunito mb-5">
          Bier-Golf — das Präzisions-Trinkspiel
        </div>

        <ol className="flex flex-col gap-4">
          {[
            <>Jeder Spieler wiegt sein volles Bier. Das ist das <strong className="text-cream">Startgewicht</strong>.</>,
            <>Ein Spieler legt das <strong className="text-cream">Par</strong> fest — ein Zielgewicht, auf das getrunken werden soll.</>,
            <>Alle trinken, um möglichst genau das Par-Gewicht zu erreichen, und wiegen dann nach.</>,
            <>Wer am nächsten am Par ist, gewinnt die Runde (<strong className="text-cream">kleinster |Delta|-Wert</strong>).</>,
            <>Der Gewinner legt das nächste Par fest.</>,
            <>Das Spiel endet, wenn alle Biere leer sind.</>,
            <>Das niedrigste <strong className="text-cream">Gesamt-Delta</strong> über alle Runden gewinnt — weniger ist besser.</>,
          ].map((rule, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-bebas text-gold text-[1.1rem] leading-none mt-[2px] w-4 shrink-0">{i + 1}</span>
              <span className="font-nunito text-cream text-[0.85rem] leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>

        <div
          className="mt-5 text-[0.78rem] leading-relaxed rounded-r-[10px] p-3"
          style={{
            background: 'rgba(240,165,0,0.07)',
            border: '1px solid rgba(240,165,0,0.2)',
            borderLeft: '3px solid #f0a500',
          }}
        >
          <span className="text-muted">
            Tipp: Wer das Par setzt, hat einen strategischen Vorteil — also gut überlegen!
          </span>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-muted text-[0.82rem] mb-4 leading-relaxed rounded-r-[10px] p-4"
      style={{
        background: 'rgba(240,165,0,0.07)',
        border: '1px solid rgba(240,165,0,0.2)',
        borderLeft: '3px solid #f0a500',
      }}
    >
      {children}
    </div>
  )
}

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

export default function SetupTab() {
  const { state, updateState, showToast, setActiveTab } = useGame()
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [firstPar, setFirstPar] = useState('500')
  const [showHowTo, setShowHowTo] = useState(false)

  const addPlayer = () => {
    const name = newName.trim()
    if (!name) return
    const w = parseFloat(newWeight)
    updateState((prev) => ({
      ...prev,
      players: [...prev.players, { name, startWeight: isNaN(w) ? null : w }],
    }))
    setNewName('')
    setNewWeight('')
  }

  const removePlayer = (i: number) => {
    updateState((prev) => ({
      ...prev,
      players: prev.players.filter((_, idx) => idx !== i),
    }))
  }

  const startGame = () => {
    if (state.players.length < 2) return showToast('Mindestens 2 Spieler!')
    const missing = state.players.filter((p) => !p.startWeight || p.startWeight <= 0)
    if (missing.length)
      return showToast('Startgewicht fehlt: ' + missing.map((p) => p.name).join(', '))
    const par = parseFloat(firstPar)
    if (!par || par <= 0) return showToast('Bitte Par für Runde 1 eingeben!')

    updateState((prev) => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      rounds: [
        {
          par,
          caller: '(Runde 1)',
          entries: prev.players.map(() => ({ weight: null, drunk: null, absDelta: null })),
        },
      ],
    }))
    setActiveTab('runde')
    showToast('🍺 Spiel gestartet!')
  }

  const resetAll = () => {
    if (!confirm('Alles löschen?')) return
    updateState(() => ({ players: [], rounds: [], gameStarted: false, gameOver: false }))
    showToast('🗑 Zurückgesetzt')
  }

  return (
    <div className="animate-fadeIn">
      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}

      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowHowTo(true)}
          className="px-4 py-2 bg-transparent border border-border text-cream rounded-[10px] font-nunito font-extrabold text-[0.75rem] uppercase tracking-[0.5px] cursor-pointer hover:border-gold hover:text-gold transition-all"
        >
          ? Spielanleitung
        </button>
      </div>

      {/* Players card */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
          🏌️ Spieler &amp; Startgewicht
        </div>
        <InfoBox>
          Vor Spielbeginn wiegt jeder sein{' '}
          <strong className="text-cream">volles Bier</strong> ein — das ist das
          Startgewicht. Dieses Gewicht wird über alle Runden als Grundlage verwendet.
        </InfoBox>

        {state.players.length === 0 ? (
          <div className="text-center py-10 text-muted">
            <span className="text-4xl block mb-2">👤</span>
            Noch keine Spieler
          </div>
        ) : (
          <div className="flex flex-col gap-[0.45rem]">
            {state.players.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-bg2 border border-border rounded-[10px] px-4 py-2"
              >
                <span className="flex-1 font-bold">{p.name}</span>
                <span className="font-mono text-[0.85rem] text-gold">
                  {p.startWeight != null ? p.startWeight + 'g' : '—'}
                </span>
                <button
                  onClick={() => removePlayer(i)}
                  className="bg-transparent border border-transparent text-muted text-[0.75rem] px-3 py-1 rounded cursor-pointer font-nunito font-extrabold uppercase tracking-[0.5px] hover:text-red transition-colors"
                  style={{ transition: 'all 0.15s' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(240,90,90,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'transparent'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="Name..."
            className="flex-1 !mb-0"
          />
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="g"
            className="!w-[90px] !mb-0"
          />
          <button
            onClick={addPlayer}
            className="px-5 bg-gold text-bg rounded-[10px] font-nunito font-extrabold text-[0.82rem] uppercase tracking-[0.5px] cursor-pointer border-none hover:bg-amber hover:-translate-y-px transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* Par card */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <div className="font-bebas text-[1.3rem] tracking-[2px] text-gold mb-4">
          ⛳ Runde 1 – Par
        </div>
        <InfoBox>
          In der ersten Runde sagt{' '}
          <strong className="text-cream">irgendjemand</strong> das Par an. Ab Runde 2
          ruft immer der Spieler mit der{' '}
          <strong className="text-cream">kleinsten absoluten Differenz</strong> der
          letzten Runde das nächste Par aus. Das Par sollte stets{' '}
          <strong className="text-cream">unter dem geringsten Endgewicht</strong> der
          vorigen Runde liegen.
        </InfoBox>
        <label className="block text-[0.7rem] tracking-[1.5px] uppercase text-muted mb-1">
          Par für Runde 1 (in Gramm)
        </label>
        <input
          type="number"
          value={firstPar}
          onChange={(e) => setFirstPar(e.target.value)}
          className="!max-w-[160px] !text-center !text-[1.3rem]"
        />
      </div>

      <div className="flex gap-2 flex-wrap mt-4">
        <BtnGold onClick={startGame}>🍺 Spiel starten</BtnGold>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-transparent border border-border text-cream rounded-[10px] font-nunito font-extrabold text-[0.75rem] uppercase tracking-[0.5px] cursor-pointer hover:border-gold hover:text-gold transition-all"
        >
          🗑 Zurücksetzen
        </button>
      </div>
    </div>
  )
}
