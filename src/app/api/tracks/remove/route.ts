import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { getMemberRole, canEdit } from '@/lib/access'
import { pusherServer } from '@/lib/realtime'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playlistTrackId } = await req.json().catch(() => ({}))
  if (!playlistTrackId)
    return NextResponse.json({ error: 'playlistTrackId required' }, { status: 400 })

  const pt = await prisma.playlistTrack.findUnique({
    where: { id: playlistTrackId },
    select: { id: true, playlistId: true, position: true },
  })
  if (!pt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { role } = await getMemberRole(userId, pt.playlistId)
  if (!canEdit(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.$transaction(async (tx) => {
    await tx.playlistTrack.delete({ where: { id: pt.id } })
    await tx.playlistTrack.updateMany({
      where: { playlistId: pt.playlistId, position: { gt: pt.position } },
      data: { position: { decrement: 1 } },
    })
  })

  await pusherServer.trigger(`playlist-${pt.playlistId}`, 'track:remove', { playlistTrackId })
  return NextResponse.json({ ok: true })
}
