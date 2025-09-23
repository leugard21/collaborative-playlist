'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ReorderButtons({
  playlistTrackId,
  index,
  maxIndex,
}: {
  playlistTrackId: string
  index: number
  maxIndex: number
}) {
  async function move(toIndex: number) {
    try {
      const res = await fetch('/api/tracks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistTrackId, toIndex }),
      })
      if (!res.ok) throw new Error()
    } catch {
      toast.error('Could not reorder track')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="Move up"
        disabled={index <= 0}
        onClick={() => move(index - 1)}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="Move down"
        disabled={index >= maxIndex}
        onClick={() => move(index + 1)}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
