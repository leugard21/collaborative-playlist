import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { pusherServer } from '@/lib/realtime'
import { canEdit, getMemberRole } from '@/lib/access'

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const { role } = await getMemberRole(userId, playlistId)
  if (!canEdit(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  const payload = { playlistTrackId: pt.id }
  await pusherServer.trigger(`playlist-${playlistId}`, 'track:add', payload)

  return NextResponse.json({ id: pt.id }, { status: 201 })
}
