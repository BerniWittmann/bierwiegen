import { GameState, Round } from './types'

export const STORAGE_KEY = 'bwv3'

export const INITIAL_STATE: GameState = {
  players: [],
  rounds: [],
  gameStarted: false,
  gameOver: false,
}

export function curRound(S: GameState): Round | undefined {
  return S.rounds[S.rounds.length - 1]
}

export function curRoundIdx(S: GameState): number {
  return S.rounds.length - 1
}

/** How much beer player pi has left BEFORE a given round index */
export function remainingBefore(S: GameState, pi: number, roundIdx: number): number {
  let drunk = 0
  for (let r = 0; r < roundIdx && r < S.rounds.length; r++) {
    const e = S.rounds[r].entries[pi]
    if (e && e.drunk != null) drunk += e.drunk
  }
  return Math.max(0, (S.players[pi].startWeight ?? 0) - drunk)
}

export function loadState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    if (d) return JSON.parse(d) as GameState
  } catch {
    // ignore
  }
  return INITIAL_STATE
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
