'use client'

import { SortableTrackList } from '@/components/playlists/sortable-track-list'
import { ReadOnlyTrackList } from '@/components/playlists/readonly-track-list'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMemo, useState } from 'react'

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

export function PlaylistTracks({
  items,
  canEdit,
  canVote,
}: {
  items: Item[]
  canEdit: boolean
  canVote: boolean
}) {
  const [mode, setMode] = useState<'order' | 'score'>('order')

  const ordered = useMemo(() => [...items].sort((a, b) => a.position - b.position), [items])
  const byScore = useMemo(
    () => [...items].sort((a, b) => b.score - a.score || a.position - b.position),
    [items],
  )

  return (
    <div className="space-y-3">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'order' | 'score')}>
        <TabsList>
          <TabsTrigger value="order">Playlist order</TabsTrigger>
          <TabsTrigger value="score">Top voted</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'order' ? (
        <SortableTrackList items={ordered} canEdit={canEdit} canVote={canVote} />
      ) : (
        <ReadOnlyTrackList items={byScore} canEdit={canEdit} canVote={canVote} />
      )}
    </div>
  )
}
