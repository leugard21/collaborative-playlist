'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

type Props = {
  playlistTrackId: string
  score: number
  userVote: 1 | -1 | 0
  onChanged?: (next: { score: number; userVote: 1 | -1 | 0 }) => void
}

export function VoteButton({ playlistTrackId, score, userVote, onChanged }: Props) {
  const [local, setLocal] = useState<{ score: number; userVote: 0 | 1 | -1 }>({
    score,
    userVote,
  })

  useEffect(() => setLocal({ score, userVote }), [score, userVote])

  async function cast(nextVote: 1 | -1) {
    const prev = { ...local }
    const same = local.userVote === nextVote
    const optimistic = {
      userVote: (same ? 0 : nextVote) as 0 | 1 | -1,
      score:
        prev.score +
        (prev.userVote === 1 ? -1 : prev.userVote === -1 ? 1 : 0) +
        (same ? 0 : nextVote),
    }
    setLocal(optimistic)
    onChanged?.(optimistic)

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTrackId,
          value: same ? 0 : nextVote,
        }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLocal(prev)
      onChanged?.(prev)
      toast.error('Vote failed')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={local.userVote === 1 ? 'default' : 'outline'}
        size={'icon'}
        aria-label="Upvote"
        className={cn('size-8')}
        onClick={() => cast(1)}
      >
        <ArrowUp className="size-4" />
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{local.score}</span>
      <Button
        variant={local.userVote === -1 ? 'default' : 'outline'}
        size="icon"
        aria-label="Downvote"
        className={cn('h-8 w-8')}
        onClick={() => cast(-1)}
      >
        <ArrowDown className="size-4" />
      </Button>
    </div>
  )
}
