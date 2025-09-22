import { prisma } from './db'

type TokenInfo = {
  accessToken: string
  refreshed: boolean
}

export async function getSpotifyAccessTokenForUser(userId: string): Promise<TokenInfo | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'spotify' },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  })
  if (!account?.access_token) return null

  const now = Math.floor(Date.now() / 1000)
  const needsRefresh = !account.expires_at || account.expires_at - 60 < now

  if (!needsRefresh) return { accessToken: account.access_token, refreshed: false }

  if (!account.refresh_token) return { accessToken: account.access_token, refreshed: false }

  const body = new URLSearchParams()
  body.set('grant_type', 'refresh_token')
  body.set('refresh_token', account.refresh_token)

  const res = await fetch('https://accounts.spotify.com/api/token', {
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

  if (!res.ok) return { accessToken: account.access_token, refreshed: false }

  const json = (await res.json()) as {
    access_token: string
    expires_in?: number
    refresh_token?: string
  }

  const newAccess = json.access_token
  const newExpiresAt = json.expires_in ? now + json.expires_in : (account.expires_at ?? now + 3600)
  const newRefresh = json.refresh_token ?? account.refresh_token

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: newAccess,
      refresh_token: newRefresh,
      expires_at: newExpiresAt,
    },
  })

  return { accessToken: newAccess, refreshed: true }
}
