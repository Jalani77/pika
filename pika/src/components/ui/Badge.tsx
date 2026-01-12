import React from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'red' | 'yellow' | 'green'

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    default: 'bg-zinc-900 text-zinc-200 border-zinc-800',
    red: 'bg-red-500/15 text-red-200 border-red-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
    green: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

