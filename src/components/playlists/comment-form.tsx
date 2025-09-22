'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

export function CommentForm({ playlistId }: { playlistId: string }) {
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setPending(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, body }),
      })
      if (!res.ok) throw new Error()
      setBody('')
      toast.success('Comment added')
    } catch {
      toast.error('Could not add comment')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        rows={2}
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Posting…' : 'Post'}
      </Button>
    </form>
  )
}
