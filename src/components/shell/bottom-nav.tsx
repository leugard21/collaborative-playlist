"use client";

import Link from "next/link";
import { Home, Search, ListMusic, Activity, User } from "lucide-react";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/playlists", label: "Playlists", Icon: ListMusic },
  { href: "/activity", label: "Activity", Icon: Activity },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background sm:hidden">
      <ul className="flex h-14 items-stretch justify-between">
        {items.map(({ href, label, Icon }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              className="flex h-full flex-col items-center justify-center text-xs"
            >
              <Icon className="mb-1 size-4" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
