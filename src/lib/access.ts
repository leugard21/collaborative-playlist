import { prisma } from './db'

export type MemberRole = 'OWNER' | 'EDITOR' | 'VIEWER' | null

export async function getMemberRole(userId: string | null, playlistId: string) {
  if (!userId) return { role: null as MemberRole, isOwner: false }
  const pl = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { ownerId: true },
  })
  if (!pl) return { role: null as MemberRole, isOwner: false }

  if (pl.ownerId === userId) return { role: 'OWNER' as MemberRole, isOwner: true }

  const m = await prisma.membership.findUnique({
    where: { userId_playlistId: { userId, playlistId } },
    select: { role: true },
  })
  return { role: (m?.role as MemberRole) ?? null, isOwner: false }
}

export async function canViewPlaylist(playlistId: string, userId: string | null) {
  const pl = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { visibility: true, ownerId: true },
  })
  if (!pl) return { ok: false as const }
  if (pl.visibility === 'PUBLIC') return { ok: true as const }
  if (pl.ownerId === userId) return { ok: true as const }
  if (!userId) return { ok: false as const }
  const m = await prisma.membership.findUnique({
    where: { userId_playlistId: { userId, playlistId } },
    select: { userId: true },
  })
  return { ok: Boolean(m) }
}

export function canEdit(role: MemberRole) {
  return role === 'OWNER' || role === 'EDITOR'
}
export function canComment(role: MemberRole) {
  return role === 'OWNER' || role === 'EDITOR'
}
export function canVote(role: MemberRole) {
  return role === 'OWNER' || role === 'EDITOR' || role === 'VIEWER'
}
