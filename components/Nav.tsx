'use client'

import { useGame } from '@/lib/gameState'
import { TabName } from '@/lib/types'

const TABS: { id: TabName; label: string }[] = [
  { id: 'setup', label: '⚙️ Setup' },
  { id: 'runde', label: '🎯 Runde' },
  { id: 'tabelle', label: '📊 Tabelle' },
  { id: 'rangliste', label: '🏆 Rangliste' },
]

export default function Nav() {
  const { activeTab, setActiveTab } = useGame()

  return (
    <nav className="flex bg-surface border border-border rounded-[14px] p-1 gap-1 mb-8 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-fit px-3 py-2 rounded-[10px] font-nunito font-bold text-[0.78rem] tracking-[0.5px] uppercase cursor-pointer transition-all whitespace-nowrap border-none ${
            activeTab === tab.id
              ? 'bg-gold text-bg'
              : 'bg-transparent text-muted hover:text-cream'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
