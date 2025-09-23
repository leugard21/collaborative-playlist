/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { getPusherClient } from '@/lib/realtime'
import { ActivityItem } from './activity-item'
import { useEffect, useState } from 'react'

type Actor = { id: string; name: string | null; image: string | null }
type Activity = {
  id: string
  type: 'TRACK_ADD' | 'TRACK_REMOVE' | 'TRACK_REORDER' | 'VOTE' | 'COMMENT'
  data: any
  createdAt: string
  actor: Actor | null
}

export function ActivityList({ playlistId, initial }: { playlistId: string; initial: Activity[] }) {
  const [items, setItems] = useState<Activity[]>(initial)

  useEffect(() => {
    const p = getPusherClient()
    const ch = p.subscribe(`playlist-${playlistId}`)

    const onAdd = () => {
      fetch(`/api/activity?playlistId=${playlistId}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((json) => {
          if (Array.isArray(json.items)) setItems(json.items)
        })
        .catch(() => {})
    }

    ch.bind('activity:add', onAdd)
    ch.bind('track:add', onAdd)
    ch.bind('track:remove', onAdd)
    ch.bind('track:reorder', onAdd)
    ch.bind('vote:change', onAdd)
    ch.bind('comment:add', onAdd)

    return () => {
      ch.unbind('activity:add', onAdd)
      ch.unbind('track:add', onAdd)
      ch.unbind('track:remove', onAdd)
      ch.unbind('track:reorder', onAdd)
      ch.unbind('vote:change', onAdd)
      ch.unbind('comment:add', onAdd)
      p.unsubscribe(`playlist-${playlistId}`)
    }
  }, [playlistId])

  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">No recent activity.</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <ActivityItem key={a.id} a={a} />
      ))}
    </ul>
  )
}
