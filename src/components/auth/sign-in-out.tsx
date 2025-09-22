'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut } from 'lucide-react'

export function SignInOutButton() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null

  if (session?.user) {
    return (
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    )
  }
  return (
    <Button size="sm" onClick={() => signIn('spotify')} className="cursor-pointer">
      <LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  )
}
