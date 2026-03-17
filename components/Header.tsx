export default function Header() {
  return (
    <header className="text-center pt-10 pb-6">
      <h1
        className="font-bebas text-gold leading-none tracking-[6px]"
        style={{
          fontSize: 'clamp(3.5rem, 12vw, 6rem)',
          filter: 'drop-shadow(0 0 30px rgba(240,165,0,.35))',
        }}
      >
        🍺 Bierwiegen
      </h1>
      <p className="text-muted text-xs tracking-[3px] uppercase mt-1">
        Bier-Golf Präzisionssport
      </p>
    </header>
  )
}
