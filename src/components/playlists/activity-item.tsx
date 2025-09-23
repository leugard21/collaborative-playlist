/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image'

type Actor = { id: string; name: string | null; image: string | null }
type Activity = {
  id: string
  type: 'TRACK_ADD' | 'TRACK_REMOVE' | 'TRACK_REORDER' | 'VOTE' | 'COMMENT'
  data: any
  createdAt: string
  actor: Actor | null
}

export function ActivityItem({ a }: { a: Activity }) {
  const who = a.actor?.name ?? 'Someone'
  const when = new Date(a.createdAt).toLocaleString()

  let text = ''
  switch (a.type) {
    case 'TRACK_ADD':
      text = `${who} added “${a.data?.title ?? 'a track'}”`
      break
    case 'TRACK_REMOVE':
      text = `${who} removed a track`
      break
    case 'TRACK_REORDER':
      text = `${who} moved a track`
      break
    case 'VOTE':
      text = `${who} ${a.data?.value === 1 ? 'upvoted' : a.data?.value === -1 ? 'downvoted' : 'voted'}`
      break
    case 'COMMENT':
      text = `${who} commented`
      break
  }

  return (
    <li className="flex items-start gap-3">
      {a.actor?.image ? (
        <Image
          src={a.actor.image}
          alt={a.actor.name ?? ''}
          width={24}
          height={24}
          className="mt-0.5 h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <div className="bg-muted mt-0.5 h-6 w-6 rounded-full" aria-hidden />
      )}
      <div className="min-w-0">
        <div className="text-sm">{text}</div>
        <div className="text-muted-foreground text-xs">{when}</div>
      </div>
    </li>
  )
}
