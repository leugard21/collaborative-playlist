/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

type NowPlaying = {
  isPlaying: boolean
  progressMs: number
  durationMs: number
  title: string
  artist: string
  album: string
  artwork: string
  previewUrl: string | null
}

export function NowPlayingCard() {
  const [data, setData] = useState<NowPlaying | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [previewPlaying, setPreviewPlaying] = useState(false)

  async function fetchNowPlaying(signal?: AbortSignal) {
    try {
      setError(null)
      const res = await fetch('/api/spotify/now-playing', {
        signal: signal ?? null,
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed')
      const json = (await res.json()) as NowPlaying | { isPlaying: false; item: null }
      if ('item' in json) {
        setData(null)
      } else {
        setData(json)
      }
    } catch (e: any) {
      setError('Could not load now playing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    fetchNowPlaying(ctrl.signal)
    const id = setInterval(() => fetchNowPlaying(ctrl.signal), 5000)
    return () => {
      ctrl.abort()
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!data?.previewUrl && previewPlaying) {
      setPreviewPlaying(false)
      audioRef.current?.pause()
    }
  }, [data?.previewUrl, previewPlaying])

  function togglePreview() {
    if (!data?.previewUrl) return
    if (!audioRef.current) {
      const a = new Audio(data.previewUrl)
      a.addEventListener('ended', () => setPreviewPlaying(false))
      audioRef.current = a
    }
    if (previewPlaying) {
      audioRef.current.pause()
      setPreviewPlaying(false)
    } else {
      audioRef.current.currentTime = 0
      audioRef.current
        .play()
        .then(() => setPreviewPlaying(true))
        .catch(() => setPreviewPlaying(false))
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground rounded border p-4 text-sm">Loading now playing...</div>
    )
  }

  if (error) {
    return <div className="text-muted-foreground rounded border p-4 text-sm">{error}</div>
  }

  if (!data) {
    return (
      <div className="text-muted-foreground rounded border p-4 text-sm">
        Nothing playing on Spotify right now.
      </div>
    )
  }

  const pct =
    data.durationMs > 0 ? Math.min(100, Math.round((data.progressMs / data.durationMs) * 100)) : 0

  return (
    <div className="flex items-center gap-4 rounded border p-3">
      {data.artwork ? (
        <Image
          src={data.artwork}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 flex-shrink-0 rounded object-cover"
        />
      ) : (
        <div className="bg-muted h-16 w-16 flex-shrink-0 rounded" aria-hidden />
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{data.title}</div>
        <div className="text-muted-foreground truncate text-xs">
          {data.artist} {data.album ? `• ${data.album}` : ''}
        </div>

        <div className="bg-muted mt-2 h-1 w-full overflow-hidden rounded">
          <div
            className={cn('bg-primary h-1 transition-all')}
            style={{ width: `${pct}%` }}
            aria-label="Progress"
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center">
        <Button
          size="icon"
          variant={data.previewUrl ? 'default' : 'outline'}
          aria-label={previewPlaying ? 'Pause preview' : 'Play preview'}
          disabled={!data.previewUrl}
          onClick={togglePreview}
          className="h-9 w-9"
          title={data.previewUrl ? '30s preview' : 'Preview not available'}
        >
          {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
