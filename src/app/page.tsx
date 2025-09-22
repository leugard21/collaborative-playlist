import Link from 'next/link'
import { auth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  const session = await auth()
  const playlists = session?.user
    ? await prisma.playlist.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, title: true, description: true },
      })
    : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Playlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Create playlists with friends, vote on tracks, and see updates in real time.
          </p>
          <Button asChild>
            <Link href="/playlists/new">Create playlist</Link>
          </Button>
        </CardContent>
      </Card>

      {session?.user && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <Link key={p.id} href={`/playlists/${p.id}`}>
              <Card className="h-full transition hover:shadow">
                <CardHeader>
                  <CardTitle className="truncate">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {p.description || '—'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
