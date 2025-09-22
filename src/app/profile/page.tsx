import Image from 'next/image'
import { auth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>Not signed in</CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = session.user.id
  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, emailVerified: true },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { id: true, provider: true, scope: true },
      orderBy: { provider: 'asc' },
    }),
  ])

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'Avatar'}
              width={56}
              height={56}
              className="size-14 rounded-full"
            />
          ) : (
            <div className="bg-muted size-14 rounded-full" aria-hidden />
          )}
          <div className="space-y-1">
            <div className="text-sm font-medium">{user?.name ?? 'Unknown User'}</div>
            <div className="text-muted-foreground text-sm">{user?.email ?? '—'}</div>
            <div className="text-muted-foreground text-sm">
              {user?.emailVerified ? 'Email verivied' : 'Email not verified'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No providers connected yet.</p>
          ) : (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li className="flex items-center justify-between" key={a.id}>
                  <span className="capitalize">{a.provider}</span>
                  <Badge variant={'secondary'}>connected</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
