import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-providet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/shell/header'
import { BottomNav } from '@/components/shell/bottom-nav'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Collaborative Playlist',
  description: 'Real-time, collaborative playlists powered by Spotify',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TooltipProvider>
            <Header />
            <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-screen-xl px-4 pt-4 pb-16">
              {children}
            </main>
            <BottomNav />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
