import { cn } from '../../lib/utils'

export function Toggle({
  checked,
  onCheckedChange,
  label,
  description,
}: {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-left transition hover:bg-zinc-950/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-50">{label}</div>
          {description ? (
            <div className="mt-1 text-xs text-zinc-400">{description}</div>
          ) : null}
        </div>
        <span
          className={cn(
            'relative mt-0.5 inline-flex h-6 w-11 flex-none items-center rounded-full border border-zinc-700 transition',
            checked ? 'bg-indigo-500/90' : 'bg-zinc-900',
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow transition',
              checked ? 'translate-x-5' : 'translate-x-1',
            )}
          />
        </span>
      </div>
    </button>
  )
}

