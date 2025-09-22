'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function RemoveTrackButton({ playlistTrackId }: { playlistTrackId: string }) {
  async function removeIt() {
    try {
      const res = await fetch('/api/tracks/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistTrackId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Removed')
      location.reload()
    } catch {
      toast.error('Could not remove')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Remove track"
      onClick={removeIt}
      className="h-8 w-8"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
