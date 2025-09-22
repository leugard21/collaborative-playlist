import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { createPlaylistSchema } from '@/lib/validators/playlist'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = createPlaylistSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { title, description, visibility } = parsed.data
  const playlist = await prisma.playlist.create({
    data: {
      title,
      description: description ?? null,
      visibility,
      ownerId: session.user.id,
      memberships: {
        create: {
          userId: session.user.id,
          role: 'OWNER',
        },
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ id: playlist.id }, { status: 201 })
}
