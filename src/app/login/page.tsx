import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInButtons } from '@/components/auth/sign-in-buttons'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/profile')

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Sign in to create playlists, invite friends, and vote on tracks.
          </p>
          <SignInButtons />
          <p className="text-muted-foreground text-xs">
            By continuining you agree to our{' '}
            <Link className="underline" href={'/terms'}>
              Terms
            </Link>{' '}
            and{' '}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
