import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const playlists = await prisma.playlist.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { id: true, description: true, visibility: true, createdAt: true },
  })
  return NextResponse.json({ playlists })
}
