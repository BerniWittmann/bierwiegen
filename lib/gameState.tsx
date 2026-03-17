'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { GameState, TabName } from './types'
import { loadState, saveState, INITIAL_STATE } from './gameLogic'

interface GameContextValue {
  state: GameState
  updateState: (updater: (prev: GameState) => GameState) => void
  toast: string
  showToast: (msg: string) => void
  activeTab: TabName
  setActiveTab: (tab: TabName) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState<TabName>('setup')
  const [hydrated, setHydrated] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  const updateState = useCallback((updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }, [])

  if (!hydrated) return null

  return (
    <GameContext.Provider
      value={{ state, updateState, toast, showToast, activeTab, setActiveTab }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
