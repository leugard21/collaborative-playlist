import { redirect } from 'next/navigation'
import { auth } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePlaylistForm } from '@/components/playlists/create-form'

export default async function NewPlaylistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePlaylistForm />
        </CardContent>
      </Card>
    </div>
  )
}
