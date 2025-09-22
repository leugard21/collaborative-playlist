'use client'

import { useRouter } from 'next/navigation'
import { getPusherClient } from '@/lib/realtime'
import { useEffect } from 'react'

export function RealtimePlaylistClient({ playlistId }: { playlistId: string }) {
  const router = useRouter()

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`playlist-${playlistId}`)

    const refresh = () => router.refresh()
    channel.bind('track:add', refresh)
    channel.bind('vote:change', refresh)
    channel.bind('track:remove', refresh)

    return () => {
      channel.unbind('track:add', refresh)
      channel.unbind('vote:change', refresh)
      channel.unbind('track:remove', refresh)
      pusher.unsubscribe(`playlist-${playlistId}`)
    }
  }, [playlistId, router])

  return null
}
