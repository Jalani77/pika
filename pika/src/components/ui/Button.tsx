import React from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'secondary' | 'ghost' | 'danger'

export function Button({
  className,
  variant = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50'
  const styles: Record<Variant, string> = {
    default: 'bg-indigo-500 text-white hover:bg-indigo-400',
    secondary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 border border-zinc-800',
    ghost: 'bg-transparent text-zinc-200 hover:bg-zinc-900/60',
    danger: 'bg-red-500/90 text-white hover:bg-red-500',
  }
  return <button className={cn(base, styles[variant], className)} {...props} />
}

