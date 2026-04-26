import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Space_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['400', '500', '600', '700'],
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Faith Hoopers Camp',
  description: 'Where Faith Meets Basketball — Kigali, Rwanda',
  openGraph: {
    title: 'Faith Hoopers Camp',
    description: 'Where Faith Meets Basketball',
    images: ['/logo.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} ${spaceMono.variable}`}>
      <body className="bg-brand-cream font-sans text-brand-coal antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
