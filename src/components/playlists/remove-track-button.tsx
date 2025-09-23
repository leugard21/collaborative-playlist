'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function RemoveTrackButton({ playlistTrackId }: { playlistTrackId: string }) {
  async function onRemove() {
    try {
      const res = await fetch('/api/tracks/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistTrackId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Track removed')
    } catch {
      toast.error('Could not remove track')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Remove track"
      className="h-8 w-8"
      onClick={onRemove}
    >
      <X className="h-4 w-4" />
    </Button>
  )
}
