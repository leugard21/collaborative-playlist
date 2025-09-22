'use client'

import Image from 'next/image'
import { getPusherClient } from '@/lib/realtime'
import { useEffect, useState } from 'react'

type Comment = {
  id: string
  body: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

export function CommentList({ playlistId, initial }: { playlistId: string; initial: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initial)

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`playlist-${playlistId}`)

    const onNew = (c: Comment) => {
      setComments((prev) => [c, ...prev])
    }

    channel.bind('comment:add', onNew)
    return () => {
      channel.unbind('comment:add', onNew)
      pusher.unsubscribe(`playlist-${playlistId}`)
    }
  }, [playlistId])

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          {c.user.image ? (
            <Image
              src={c.user.image}
              alt={c.user.name ?? ''}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="bg-muted h-8 w-8 rounded-full" aria-hidden />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{c.user.name ?? 'Anon'}</span>
              <span className="text-muted-foreground text-xs">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
