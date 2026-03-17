import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#f0a500',
}

export const metadata: Metadata = {
  title: 'Bierwiegen – Bier-Golf Präzisionssport App',
  description:
    'Bierwiegen ist die App für Bier-Golf: Messe dein Biergewicht, verfolge Runden und Scores, und finde heraus, wer am präzisesten trinkt.',
  keywords: 'Bierwiegen, Bier Golf, Biergolf, Trinkspiel, Partyspiel, Bier App, Bier Score',
  authors: [{ name: 'Bierwiegen' }],
  metadataBase: new URL('https://bierwiegen.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://bierwiegen.app/',
    title: 'Bierwiegen – Bier-Golf Präzisionssport',
    description:
      'Die App für Bier-Golf: Messe dein Biergewicht, verfolge Runden und Scores, und finde heraus, wer am präzisesten trinkt.',
    images: [{ url: '/icon.svg' }],
    locale: 'de_DE',
    siteName: 'Bierwiegen',
  },
  twitter: {
    card: 'summary',
    title: 'Bierwiegen – Bier-Golf Präzisionssport',
    description:
      'Die App für Bier-Golf: Messe dein Biergewicht, verfolge Runden und Scores, und finde heraus, wer am präzisesten trinkt.',
    images: ['/icon.svg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bierwiegen',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍺</text></svg>",
    apple: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Non-blocking font load: media="print" loads async, JS switches to "all" */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-expect-error onLoad not typed for link
          onLoad="this.media='all'"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
