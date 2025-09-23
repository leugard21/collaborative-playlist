'use client'

import Image from 'next/image'
import { VoteButton } from '@/components/playlists/vote-button'
import { RemoveTrackButton } from '@/components/playlists/remove-track-button'
import { ReorderButtons } from '@/components/playlists/reorder-buttons'
import { formatMs } from '@/lib/format'

type Item = {
  id: string
  position: number
  score: number
  userVote: 0 | 1 | -1
  track: {
    title: string
    artist: string
    album?: string | null
    artwork?: string | null
    durationMs: number
  }
}

export function ReadOnlyTrackList({
  items,
  canEdit,
  canVote,
}: {
  items: Item[]
  canEdit: boolean
  canVote: boolean
}) {
  return (
    <ol className="divide-y rounded-md border">
      {items.length === 0 ? (
        <li className="text-muted-foreground p-4 text-sm">No tracks yet.</li>
      ) : (
        items.map((pt, idx) => (
          <li key={pt.id} className="p-3">
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

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {pt.track.title}
                  <span className="text-muted-foreground ml-2 text-xs">({pt.score})</span>
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {pt.track.artist} {pt.track.album ? `• ${pt.track.album}` : ''}
                </div>
                <div className="text-muted-foreground mt-1 text-xs tabular-nums sm:hidden">
                  {formatMs(pt.track.durationMs)}
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">
                  {formatMs(pt.track.durationMs)}
                </span>

                {canEdit && (
                  <div className="opacity-40">
                    <ReorderButtons
                      playlistTrackId={pt.id}
                      index={idx}
                      maxIndex={Number.MAX_SAFE_INTEGER}
                    />
                  </div>
                )}

                {canVote && (
                  <VoteButton playlistTrackId={pt.id} score={pt.score} userVote={pt.userVote} />
                )}

                {canEdit && <RemoveTrackButton playlistTrackId={pt.id} />}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 sm:hidden">
              {canEdit && (
                <div className="opacity-40">
                  <ReorderButtons
                    playlistTrackId={pt.id}
                    index={idx}
                    maxIndex={Number.MAX_SAFE_INTEGER}
                  />
                </div>
              )}
              {canVote && (
                <VoteButton playlistTrackId={pt.id} score={pt.score} userVote={pt.userVote} />
              )}
              {canEdit && <RemoveTrackButton playlistTrackId={pt.id} />}
            </div>
          </li>
        ))
      )}
    </ol>
  )
}
