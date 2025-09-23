'use client'

import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VoteButton } from '@/components/playlists/vote-button'
import { RemoveTrackButton } from '@/components/playlists/remove-track-button'
import { ReorderButtons } from '@/components/playlists/reorder-buttons' // keep as fallback
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
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

export function SortableTrackList({
  items: initialItems,
  canEdit,
  canVote,
}: {
  items: Item[]
  canEdit: boolean
  canVote: boolean
}) {
  const [items, setItems] = useState<Item[]>(
    [...initialItems].sort((a, b) => a.position - b.position),
  )

  useEffect(() => {
    setItems([...initialItems].sort((a, b) => a.position - b.position))
  }, [initialItems])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function persistMove(id: string, toIndex: number) {
    try {
      await fetch('/api/tracks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistTrackId: id, toIndex }),
      })
    } catch {}
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(items, oldIndex, newIndex).map((it, idx) => ({ ...it, position: idx }))
    setItems(next)
    persistMove(String(active.id), newIndex)
  }

  return (
    <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ol className="divide-y rounded-md border">
          {items.length === 0 ? (
            <li className="text-muted-foreground p-4 text-sm">No tracks yet.</li>
          ) : (
            items.map((pt, idx) => (
              <SortableRow
                key={pt.id}
                id={pt.id}
                index={idx}
                item={pt}
                canEdit={canEdit}
                canVote={canVote}
                formatMs={formatMs}
              />
            ))
          )}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  id,
  index,
  item: pt,
  canEdit,
  canVote,
  formatMs,
}: {
  id: string
  index: number
  item: Item
  canEdit: boolean
  canVote: boolean
  formatMs: (ms: number) => string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn('bg-background p-3', isDragging && 'ring-primary/50 z-10 ring-2')}
      {...attributes}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'hidden h-6 w-2 cursor-grab rounded select-none sm:block',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          {...listeners}
          aria-label="Drag to reorder"
          role="button"
          tabIndex={0}
        />
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
            <ReorderButtons
              playlistTrackId={pt.id}
              index={index}
              maxIndex={Number.MAX_SAFE_INTEGER}
            />
          )}

          {canVote && (
            <VoteButton playlistTrackId={pt.id} score={pt.score} userVote={pt.userVote} />
          )}

          {canEdit && <RemoveTrackButton playlistTrackId={pt.id} />}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 sm:hidden">
        {canEdit && (
          <ReorderButtons
            playlistTrackId={pt.id}
            index={index}
            maxIndex={Number.MAX_SAFE_INTEGER}
          />
        )}
        {canVote && <VoteButton playlistTrackId={pt.id} score={pt.score} userVote={pt.userVote} />}
        {canEdit && <RemoveTrackButton playlistTrackId={pt.id} />}
        <button
          className="text-muted-foreground ml-1 h-8 rounded px-2 text-xs"
          {...listeners}
          aria-label="Drag to reorder"
        >
          Move
        </button>
      </div>
    </li>
  )
}
