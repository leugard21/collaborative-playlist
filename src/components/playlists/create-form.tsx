/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export function CreatePlaylistForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    try {
      const payload = {
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        visibility: String(formData.get('visibility') || 'PRIVATE'),
      }

      const res = await fetch('/api/playlists/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ? JSON.stringify(data.error) : 'Failed to create playlist')
      }

      const { id } = await res.json()
      toast.success('Playlist created', { description: 'Invite friends and add tracks.' })
      router.replace(`/playlists/${id}`)
    } catch (err: any) {
      toast.error('Could not create playlist', { description: err?.message ?? String(err) })
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input id="title" name="title" required placeholder="Friday Night Jams" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea id="description" name="description" rows={3} placeholder="Vibe-only queue." />
      </div>

      <div className="space-y-2">
        <label htmlFor="visibility" className="text-sm font-medium">
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          className="bg-background w-full rounded-md border p-2 text-sm"
          defaultValue="PRIVATE"
        >
          <option value="PRIVATE">Private</option>
          <option value="LINK">Anyone with link</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Creating' : 'Create Playlist'}
      </Button>
    </form>
  )
}
