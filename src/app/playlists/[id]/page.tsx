import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type props = { params: { id: string } }

export default async function PlaylistDetailPage({ params }: props) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, description: true, visibility: true, createdAt: true },
  })
  if (!playlist) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{playlist.title}</span>
            <span className="text-muted-foreground text-xs uppercase">{playlist.visibility}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {playlist.description ? (
            <p className="text-muted-foreground text-sm">{playlist.description}</p>
          ) : (
            <p className="text-muted-foreground text-sm">No description</p>
          )}
          <div className="text-muted-foreground text-xs">
            Created {playlist.createdAt.toLocaleString()}
          </div>
          <div className="pt-2 text-sm">
            <Link href="/" className="flex flex-row items-center gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
