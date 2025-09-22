'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { useState } from 'react'

type SearchItem = {
  id: string
  title: string
  artist: string
  album?: string
  durationMs: number
  artwork?: string
  previewUrl?: string
}

export function AddTrackDialog({ playlistId }: { playlistId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)

  async function doSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tracks/search?query=${encodeURIComponent(q)}`)
      const data = await res.json()
      setItems(data.items ?? [])
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  async function addTrack(item: SearchItem) {
    try {
      const res = await fetch('/api/tracks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId,
          provider: 'spotify',
          providerTrackId: item.id,
          title: item.title,
          artist: item.artist,
          album: item.album,
          durationMs: item.durationMs,
          artwork: item.artwork,
          previewUrl: item.previewUrl,
        }),
      })
      if (res.status === 409) {
        toast('Duplicate track', { description: 'Already in this playlist.' })
        return
      }
      if (!res.ok) throw new Error()
      toast.success('Added to playlist')
      location.reload()
    } catch {
      toast.error('Could not add track')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          Add tracks
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search tracks</DialogTitle>
        </DialogHeader>

        <form onSubmit={doSearch} className="flex gap-2">
          <Input
            placeholder="Search songs or artists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </Button>
        </form>

        <div className="max-h-96 overflow-auto">
          {items.length === 0 && !loading ? (
            <p className="text-muted-foreground p-3 text-sm">No results yet.</p>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 p-2">
                  <div className="flex items-center gap-3">
                    {it.artwork ? (
                      <Image
                        src={it.artwork}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-12 w-12 rounded" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{it.title}</div>
                      <div className="text-muted-foreground truncate text-xs">
                        {it.artist} {it.album ? `• ${it.album}` : ''}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => addTrack(it)}>
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
