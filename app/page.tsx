'use client'

import { useEffect } from 'react'
import { GameProvider, useGame } from '@/lib/gameState'
import Header from '@/components/Header'
import Nav from '@/components/Nav'
import Toast from '@/components/Toast'
import SetupTab from '@/components/tabs/SetupTab'
import RundeTab from '@/components/tabs/RundeTab'
import TabelleTab from '@/components/tabs/TabelleTab'
import RanglisteTab from '@/components/tabs/RanglisteTab'

function AppContent() {
  const { activeTab } = useGame()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  return (
    <div className="relative z-10 max-w-[680px] mx-auto px-4 pb-16">
      <Header />
      <Nav />
      {activeTab === 'setup' && <SetupTab />}
      {activeTab === 'runde' && <RundeTab />}
      {activeTab === 'tabelle' && <TabelleTab />}
      {activeTab === 'rangliste' && <RanglisteTab />}
      <Toast />
      <a
        href="mailto:info@bierwiegen.app"
        title="Hilfe / Kontakt"
        className="fixed bottom-6 right-6 w-[42px] h-[42px] rounded-full bg-surface border border-border text-muted text-lg font-extrabold flex items-center justify-center no-underline z-50 transition-all hover:bg-surface2 hover:border-gold hover:text-gold"
      >
        ?
      </a>
    </div>
  )
}

export default function Page() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
