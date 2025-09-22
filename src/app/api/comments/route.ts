import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { pusherServer } from '@/lib/realtime'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const playlistId = searchParams.get('playlistId')
  if (!playlistId) return NextResponse.json({ error: 'playlistId required' }, { status: 400 })

  const comments = await prisma.comment.findMany({
    where: { playlistId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playlistId, body } = await req.json().catch(() => ({}))
  if (!playlistId || !body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { playlistId, userId: session.user.id, body },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  await pusherServer.trigger(`playlist-${playlistId}`, 'comment:add', {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    user: comment.user,
  })

  return NextResponse.json({ comment })
}
