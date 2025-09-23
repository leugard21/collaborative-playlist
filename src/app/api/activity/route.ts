import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const playlistId = searchParams.get('playlistId')
  if (!playlistId) return NextResponse.json({ error: 'playlistId required' }, { status: 400 })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.activity.findMany({
    where: { playlistId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { actor: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json({
    items: items.map((a) => ({
      id: a.id,
      type: a.type,
      data: a.data,
      createdAt: a.createdAt,
      actor: a.actor,
    })),
  })
}
