'use client'

import { useGame } from '@/lib/gameState'

export default function Toast() {
  const { toast } = useGame()

  return (
    <div
      className={`fixed bottom-6 left-1/2 bg-gold text-bg px-6 py-3 rounded-full font-nunito font-extrabold text-sm pointer-events-none z-50 whitespace-nowrap transition-all duration-300 ${
        toast
          ? 'opacity-100 -translate-x-1/2 translate-y-0'
          : 'opacity-0 -translate-x-1/2 translate-y-5'
      }`}
    >
      {toast || '\u00a0'}
    </div>
  )
}
