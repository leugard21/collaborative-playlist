import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Playlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Create playlists with friends, vote on tracks, and see updates in
            real time.
          </p>
          <Button asChild>
            <Link href="/playlists/new">Create playlist</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
