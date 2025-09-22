import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  if (!json) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const {
    playlistId,
    provider = 'spotify',
    providerTrackId,
    title,
    artist,
    album,
    durationMs,
    artwork,
    previewUrl,
  } = json || {}

  if (!playlistId || !providerTrackId || !title || !artist) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const dup = await prisma.playlistTrack.findFirst({
    where: { playlistId, track: { provider, providerTrackId } },
    select: { id: true },
  })
  if (dup) {
    return NextResponse.json({ error: 'Duplicate track' }, { status: 409 })
  }

  const track = await prisma.track.upsert({
    where: { provider_providerTrackId: { provider, providerTrackId } },
    update: {
      title,
      artist,
      album,
      durationMs: Number(durationMs || 0),
      artwork,
      previewUrl,
    },
    create: {
      provider,
      providerTrackId,
      title,
      artist,
      album,
      durationMs: Number(durationMs || 0),
      artwork,
      previewUrl,
    },
    select: { id: true },
  })

  const last = await prisma.playlistTrack.findFirst({
    where: { playlistId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const nextPos = (last?.position ?? -1) + 1

  const pt = await prisma.playlistTrack.create({
    data: {
      playlistId,
      trackId: track.id,
      addedById: session.user.id,
      position: nextPos,
    },
    select: { id: true },
  })

  return NextResponse.json({ id: pt.id }, { status: 201 })
}
