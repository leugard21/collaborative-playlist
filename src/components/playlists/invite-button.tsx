'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'
import { useState } from 'react'

export function InviteButton({ playlistId }: { playlistId: string }) {
  const [loading, setLoading] = useState(false)

  async function createInvite(role: 'VIEWER' | 'EDITOR' = 'EDITOR') {
    setLoading(true)
    try {
      const res = await fetch('/api/invite/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, role, expiresInDays: 7 }),
      })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      await navigator.clipboard.writeText(url)
      toast.success('Invite link copied', { description: 'Valid for 7 days.' })
    } catch {
      toast.error('Could not create invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={() => createInvite()} disabled={loading}>
      <Share2 className="mr-2 h-4 w-4" />
      Invite
    </Button>
  )
}
