'use client'

import { signIn } from 'next-auth/react'
import { Button } from '../ui/button'
import { Music2, Mail } from 'lucide-react'

export function SignInButtons() {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => signIn('spotify')} className="w-full" size={'sm'}>
        <Music2 className="mr-2 size-4" />
        Sign in with Spotify
      </Button>

      {process.env['NEXT_PUBLIC_ENABLE_GOOGLE'] === 'true' && (
        <Button onClick={() => signIn('google')} variant={'outline'} className="w-full" size={'sm'}>
          <Mail className="mr-2 size-4" />
          Sign in with Google
        </Button>
      )}
    </div>
  )
}
