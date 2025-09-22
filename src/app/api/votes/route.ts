import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playlistTrackId, value } = await req.json().catch(() => ({}))
  if (!playlistTrackId || ![-1, 0, 1].includes(Number(value)))
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const userId = session.user.id

  if (value === 0) {
    await prisma.vote.deleteMany({ where: { playlistTrackId, userId } })
    return NextResponse.json({ ok: true })
  }

  await prisma.vote.upsert({
    where: { playlistTrackId_userId: { playlistTrackId, userId } },
    update: { value: value === 1 ? 'UP' : 'DOWN' },
    create: { playlistTrackId, userId, value: value === 1 ? 'UP' : 'DOWN' },
  })

  return NextResponse.json({ ok: true })
}
