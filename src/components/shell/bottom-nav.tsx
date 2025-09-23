'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ListMusic, Activity, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/playlists', icon: ListMusic, label: 'Playlists' },
  { href: '/activity', icon: Activity, label: 'Activity' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
      <ul className="flex w-full">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  'flex w-full flex-col items-center justify-center py-2 text-xs',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
