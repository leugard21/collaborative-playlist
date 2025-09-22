'use client'
import Link from 'next/link'
import { PlusCircle, Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignInOutButton } from '@/components/auth/sign-in-out'

export function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Home">
          <Music2 className="h-5 w-5" />
          <span className="font-semibold">Collaborative Playlist</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/playlists/new" aria-label="Create playlist">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create
            </Link>
          </Button>
          <SignInOutButton />
        </div>
      </div>
    </header>
  )
}
