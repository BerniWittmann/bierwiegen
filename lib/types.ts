export interface Player {
  name: string
  startWeight: number | null
}

export interface Entry {
  weight: number | null
  drunk: number | null
  absDelta: number | null
}

export interface Round {
  par: number | null
  caller: string
  suggestedMaxPar?: number | null
  entries: Entry[]
}

export interface GameState {
  players: Player[]
  rounds: Round[]
  gameStarted: boolean
  gameOver: boolean
}

export type TabName = 'setup' | 'runde' | 'tabelle' | 'rangliste'
