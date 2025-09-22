import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTrackDialog } from '@/components/playlists/add-track-dialog'

type Props = { params: { id: string } }

export default async function PlaylistDetailPage({ params }: Props) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      visibility: true,
      createdAt: true,
      tracks: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          position: true,
          track: {
            select: {
              id: true,
              title: true,
              artist: true,
              album: true,
              artwork: true,
              durationMs: true,
            },
          },
        },
      },
    },
  })
  if (!playlist) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="truncate">{playlist.title}</CardTitle>
          <AddTrackDialog playlistId={playlist.id} />
        </CardHeader>
        <CardContent className="space-y-4">
          {playlist.description ? (
            <p className="text-muted-foreground text-sm">{playlist.description}</p>
          ) : null}
          <ol className="divide-y rounded-md border">
            {playlist.tracks.length === 0 ? (
              <li className="text-muted-foreground p-4 text-sm">No tracks yet.</li>
            ) : (
              playlist.tracks.map((pt) => (
                <li key={pt.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{pt.track.title}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {pt.track.artist} {pt.track.album ? `• ${pt.track.album}` : ''}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs tabular-nums">
                    {formatMs(pt.track.durationMs)}
                  </div>
                </li>
              ))
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
