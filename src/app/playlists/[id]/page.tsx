import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTrackDialog } from '@/components/playlists/add-track-dialog'
import Image from 'next/image'
import { auth } from '@/lib/session'
import { VoteButton } from '@/components/playlists/vote-button'
import { RealtimePlaylistClient } from '@/components/playlists/realtime-playlist-client'
import { CommentForm } from '@/components/playlists/comment-form'
import { CommentList } from '@/components/playlists/comment-list'
import { NowPlayingCard } from '@/components/now-playing/now-playing-card'
import { InviteButton } from '@/components/playlists/invite-button'
import { boolean } from 'zod'
import { RemoveTrackButton } from '@/components/playlists/remove-track-button'

type Props = { params: { id: string } }

export default async function PlaylistDetailPage({ params }: Props) {
  const session = await auth()
  const userId = session?.user.id ?? null

  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
      visibility: true,
      tracks: {
        select: {
          id: true,
          position: true,
          votes: { select: { value: true, userId: true } },
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

  const isOwner = userId == playlist.ownerId

  let isMember = false
  let memberRole: 'OWNER' | 'EDITOR' | 'VIEWER' | null = null

  if (userId) {
    const m = await prisma.membership.findUnique({
      where: { userId_playlistId: { userId, playlistId: playlist.id } },
      select: { role: true },
    })
    isMember = Boolean(m)
    memberRole = (m?.role as unknown as typeof memberRole) ?? null
  }

  const role: 'OWNER' | 'EDITOR' | 'VIEWER' | null = isOwner ? 'OWNER' : memberRole
  const canEditUI = role === 'OWNER' || role === 'EDITOR'
  const canCommentUI = role === 'OWNER' || role === 'EDITOR'
  const canVoteUI = role === 'OWNER' || role === 'EDITOR' || role === 'VIEWER'

  const canView = playlist.visibility === 'PUBLIC' || isOwner || isMember

  if (!canView) {
    return (
      <div className="text-muted-foreground mx-auto max-w-md text-sm">
        You don&apos;t have access to this playlist.
        {playlist.visibility === 'LINK' ? (
          <div className="mt-2">Ask the owner for an invite link.</div>
        ) : null}
      </div>
    )
  }

  const items = playlist.tracks.map((pt) => {
    const up = pt.votes.filter((v) => v.value === 'UP').length
    const down = pt.votes.filter((v) => v.value === 'DOWN').length
    const score = up - down
    const my = userId ? pt.votes.find((v) => v.userId === userId) : undefined
    const userVote: 1 | -1 | 0 = !my ? 0 : my.value === 'UP' ? 1 : -1
    return { ...pt, score, userVote }
  })

  items.sort((a, b) => b.score - a.score || a.position - b.position)

  const comments = await prisma.comment.findMany({
    where: { playlistId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <NowPlayingCard />
      {isOwner && <InviteButton playlistId={playlist.id} />}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="truncate">{playlist.title}</CardTitle>
          {canEditUI && <AddTrackDialog playlistId={playlist.id} />}
        </CardHeader>
        <CardContent className="space-y-4">
          {playlist.description ? (
            <p className="text-muted-foreground text-sm">{playlist.description}</p>
          ) : null}

          <ol className="divide-y rounded-md border">
            {items.length === 0 ? (
              <li className="text-muted-foreground p-4 text-sm">No tracks yet.</li>
            ) : (
              items.map((pt) => (
                <li key={pt.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {pt.track.artwork ? (
                      <Image
                        src={pt.track.artwork}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 flex-shrink-0 rounded border object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-12 w-12 flex-shrink-0 rounded" aria-hidden />
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{pt.track.title}</div>
                      <div className="text-muted-foreground truncate text-xs">
                        {pt.track.artist} {pt.track.album ? `• ${pt.track.album}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span
                      className="text-muted-foreground w-12 text-right text-xs tabular-nums"
                      aria-label="Duration"
                    >
                      {formatMs(pt.track.durationMs)}
                    </span>

                    <VoteButton
                      playlistTrackId={pt.id}
                      score={pt.score}
                      userVote={pt.userVote as 0 | 1 | -1}
                    />

                    {canEditUI && <RemoveTrackButton playlistTrackId={pt.id} />}
                  </div>
                </li>
              ))
            )}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canCommentUI && <CommentForm playlistId={playlist.id} />}
          <CommentList
            playlistId={playlist.id}
            initial={comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>

      <RealtimePlaylistClient playlistId={playlist.id} />
    </div>
  )
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
