'use client'
import Link from 'next/link'
import { PlusCircle, Music2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'

export function Header() {
  const { data: session, status } = useSession()

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

          {status === 'loading' ? null : session?.user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut()}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
