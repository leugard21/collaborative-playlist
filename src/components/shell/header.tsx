"use client";

import Link from "next/link";
import { PlusCircle, Music2 } from "lucide-react";
import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <Link href={"/"} className="flex items-center gap-2" aria-label="Home">
          <Music2 className="size-5" />
          <span className="font-semibold">Collaborative Playlist</span>
        </Link>
        <Button asChild size={"sm"}>
          <Link href={"/playlists/new"} aria-label="Create playlist">
            <PlusCircle className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
