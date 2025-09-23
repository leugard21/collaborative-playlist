import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { getMemberRole, canEdit } from '@/lib/access'
import { pusherServer } from '@/lib/realtime'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playlistTrackId, toIndex } = await req.json().catch(() => ({}))
  if (!playlistTrackId || typeof toIndex !== 'number')
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const row = await prisma.playlistTrack.findUnique({
    where: { id: playlistTrackId },
    select: { id: true, playlistId: true, position: true },
  })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { role } = await getMemberRole(userId, row.playlistId)
  if (!canEdit(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const count = await prisma.playlistTrack.count({ where: { playlistId: row.playlistId } })
  const target = Math.max(0, Math.min(toIndex, count - 1))
  if (target === row.position) return NextResponse.json({ ok: true })

  await prisma.$transaction(async (tx) => {
    await tx.playlistTrack.update({
      where: { id: row.id },
      data: { position: -1 },
    })

    if (target < row.position) {
      // 2a) Moving UP: shift [target .. from-1] down by 1
      await tx.playlistTrack.updateMany({
        where: {
          playlistId: row.playlistId,
          position: { gte: target, lt: row.position },
        },
        data: { position: { increment: 1 } },
      })
    } else {
      await tx.playlistTrack.updateMany({
        where: {
          playlistId: row.playlistId,
          position: { gt: row.position, lte: target },
        },
        data: { position: { decrement: 1 } },
      })
    }

    await tx.playlistTrack.update({
      where: { id: row.id },
      data: { position: target },
    })
  })

  await pusherServer.trigger(`playlist-${row.playlistId}`, 'track:reorder', {
    playlistTrackId,
  })

  return NextResponse.json({ ok: true })
}
