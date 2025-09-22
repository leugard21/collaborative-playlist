/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { searchSpotifyTracks } from '@/lib/spotify'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('query') ?? '').trim()
  if (!q) return NextResponse.json({ items: [] })
  try {
    const items = await searchSpotifyTracks(q)
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Search failed' }, { status: 500 })
  }
}
