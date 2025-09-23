'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant={'ghost'} size={'icon'} aria-label="Toggle theme" className="size-8" />
  }

  const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
  const next = () => {
    const i = order.indexOf((theme as (typeof order)[number]) ?? 'system')
    const nextTheme = order[(i + 1) % order.length]
    setTheme(nextTheme)
  }

  const icon =
    (theme ?? 'system') === 'system' ? (
      <Monitor className="h-4 w-4" />
    ) : resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )

  const label =
    (theme ?? 'system') === 'system'
      ? 'Theme: System'
      : resolvedTheme === 'dark'
        ? 'Theme: Dark'
        : 'Theme: Light'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title={`${label} (click to change)`}
      className="h-8 w-8"
      onClick={next}
    >
      {icon}
    </Button>
  )
}
