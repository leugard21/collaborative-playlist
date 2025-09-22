/* eslint-disable @typescript-eslint/no-explicit-any */
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API = 'https://api.spotify.com/v1'

let cachedToken: { access_token: string; expires_at: number } | null = null

async function getAppToken() {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expires_at - 60 > now) return cachedToken.access_token

  const body = new URLSearchParams()
  body.set('grant_type', 'client_credentials')
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env['SPOTIFY_CLIENT_ID']}:${process.env['SPOTIFY_CLIENT_SECRET']}`,
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to obtain spotify token')
  const json = (await res.json()) as {
    access_token: string
    token_type: string
    expires_in: number
  }
  cachedToken = {
    access_token: json.access_token,
    expires_at: Math.floor(Date.now() / 1000) + json.expires_in,
  }
  return cachedToken.access_token
}

export type SpotifySearchItem = {
  id: string
  title: string
  artist: string
  album?: string
  durationMs: number
  artwork?: string
  previewUrl?: string
}

export async function searchSpotifyTracks(query: string): Promise<SpotifySearchItem[]> {
  if (!process.env['SPOTIFY_CLIENT_ID'] || !process.env['SPOTIFY_CLIENT_SECRET']) {
    return [
      {
        id: 'stub-track-1',
        title: 'Stub Track One',
        artist: 'Stub Artist',
        album: 'Stub Album',
        durationMs: 180000,
        artwork: '',
        previewUrl: '',
      },
    ]
  }

  const token = await getAppToken()
  const url = new URL(`${SPOTIFY_API}/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'track')
  url.searchParams.set('limit', '10')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Spotify search failed')
  const data = await res.json()
  const items = (data?.tracks?.items ?? []) as any[]
  return items.map((t) => ({
    id: t.id,
    title: t.name,
    artist: (t.artists || []).map((a: any) => a.name).join(', '),
    album: t.album?.name,
    durationMs: t.duration_ms ?? 0,
    artwork: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
    previewUrl: t.preview_url ?? undefined,
  }))
}
