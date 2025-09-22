import { NextResponse } from 'next/server'
import { auth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { randomToken } from '@/lib/crypto'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const {
    playlistId,
    role = 'VIEWER',
    expiresInDays,
  }: { playlistId: string; role?: 'VIEWER' | 'EDITOR'; expiresInDays?: number } = body || {}

  if (!playlistId) return NextResponse.json({ error: 'playlistId required' }, { status: 400 })
  if (!['VIEWER', 'EDITOR'].includes(role))
    return NextResponse.json({ error: 'invalid role' }, { status: 400 })

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { ownerId: true, title: true },
  })
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (playlist.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const token = randomToken()
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 3600 * 1000) : null

  const invite = await prisma.invite.create({
    data: { playlistId, createdById: userId, role, token, expiresAt },
    select: { token: true },
  })

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const url = `${base}/invite/${invite.token}`

  return NextResponse.json({ url })
}
