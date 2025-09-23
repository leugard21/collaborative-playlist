import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTrackDialog } from '@/components/playlists/add-track-dialog'
import { auth } from '@/lib/session'
import { RealtimePlaylistClient } from '@/components/playlists/realtime-playlist-client'
import { CommentForm } from '@/components/playlists/comment-form'
import { CommentList } from '@/components/playlists/comment-list'
import { NowPlayingCard } from '@/components/now-playing/now-playing-card'
import { InviteButton } from '@/components/playlists/invite-button'
import { ActivityList } from '@/components/playlists/activity-list'
import { PlaylistTracks } from '@/components/playlists/playlist-tracks'

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

  const isOwner = userId === playlist.ownerId

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
  const canVoteUI = Boolean(role)

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

  items.sort((a, b) => a.position - b.position)

  const comments = await prisma.comment.findMany({
    where: { playlistId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  const activity = await prisma.activity.findMany({
    where: { playlistId: playlist.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { actor: { select: { id: true, name: true, image: true } } },
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

          <PlaylistTracks items={items} canEdit={canEditUI} canVote={canVoteUI} />
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

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList
            playlistId={playlist.id}
            initial={activity.map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
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
