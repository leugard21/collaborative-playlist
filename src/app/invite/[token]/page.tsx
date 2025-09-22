import { prisma } from '@/lib/db'
import { auth } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'

type Props = { params: { token: string } }

export default async function AcceptInvitePage({ params }: Props) {
  const session = await auth()
  if (!session?.user.id)
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${params.token}`)}`)

  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
    select: {
      playlistId: true,
      role: true,
      revoked: true,
      expiresAt: true,
      playlist: { select: { title: true } },
    },
  })
  if (!invite) notFound()
  if (invite.revoked) {
    return (
      <div className="mx-auto max-w-md p-6 text-sm text-red-600">This invite has been revoked.</div>
    )
  }
  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    return <div className="mx-auto max-w-md p-6 text-sm text-red-600">This invite has expired.</div>
  }

  await prisma.membership.upsert({
    where: { userId_playlistId: { userId: session.user.id, playlistId: invite.playlistId } },
    update: { role: invite.role },
    create: { userId: session.user.id, playlistId: invite.playlistId, role: invite.role },
  })

  redirect(`/playlists/${invite.playlistId}`)
}
