import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { pusherServer } from '@/lib/realtime'
import { canVote, getMemberRole } from '@/lib/access'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playlistTrackId, value } = await req.json().catch(() => ({}))
  if (!playlistTrackId || ![-1, 0, 1].includes(Number(value)))
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const userId = session.user.id

  const pt = await prisma.playlistTrack.findUnique({
    where: { id: playlistTrackId },
    select: { playlistId: true },
  })
  if (!pt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { role } = await getMemberRole(userId, pt.playlistId)
  if (!canVote(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (value === 0) {
    await prisma.vote.deleteMany({ where: { playlistTrackId, userId } })
  } else {
    await prisma.vote.upsert({
      where: { playlistTrackId_userId: { playlistTrackId, userId } },
      update: { value: value === 1 ? 'UP' : 'DOWN' },
      create: { playlistTrackId, userId, value: value === 1 ? 'UP' : 'DOWN' },
    })
  }

  await pusherServer.trigger(`playlist-${pt.playlistId}`, 'vote:change', {
    playlistTrackId,
  })

  await prisma.activity.create({
    data: {
      playlistId: pt.playlistId,
      actorId: userId,
      type: 'VOTE',
      data: { playlistTrackId, value },
    },
  })
  await pusherServer.trigger(`playlist-${pt.playlistId}`, 'activity:add', { type: 'VOTE' })

  return NextResponse.json({ ok: true })
}
