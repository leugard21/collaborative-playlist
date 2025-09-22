/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/lib/session'
import { getSpotifyAccessTokenForUser } from '@/lib/spotify-user'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const userId = session?.user.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tokenInfo = await getSpotifyAccessTokenForUser(userId)
  if (!tokenInfo) return NextResponse.json({ isPlaying: false, item: null })

  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${tokenInfo.accessToken}` },
    cache: 'no-store',
  })

  if (res.status === 204) return NextResponse.json({ isPlaying: false, item: null })
  if (!res.ok) return NextResponse.json({ isPlaying: false, item: null })

  const data = await res.json()
  const item = data?.item
  if (!item) return NextResponse.json({ isPlaying: false, item: null })

  const payload = {
    isPlaying: Boolean(data?.is_playing),
    progressMs: Number(data?.progress_ms ?? 0),
    durationMs: Number(item?.duration_ms ?? 0),
    title: String(item?.name ?? ''),
    artist: (item?.artists ?? [])
      .map((a: any) => a?.name)
      .filter(Boolean)
      .join(', '),
    album: String(item?.album?.name ?? ''),
    artwork:
      item?.album?.images?.[1]?.url ||
      item?.album?.images?.[0]?.url ||
      item?.album?.images?.at(-1)?.url ||
      '',
    previewUrl: item?.preview_url ?? null,
  }

  return NextResponse.json(payload)
}
