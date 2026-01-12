import { useCallback, useMemo, useState } from 'react'
import { FileUp, ShieldAlert } from 'lucide-react'
import { cn } from '../lib/utils'

const ACCEPT = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export function FileDropzone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void
  disabled?: boolean
}) {
  const [isOver, setIsOver] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const acceptAttr = useMemo(() => '.pdf,.docx', [])

  const validate = useCallback((file: File) => {
    const okMime = ACCEPT.includes(file.type)
    const okExt = file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')
    if (!okMime && !okExt) return 'Please upload a PDF or DOCX file.'
    if (file.size > 25 * 1024 * 1024) return 'File too large (max 25MB).'
    return null
  }, [])

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return
      const err = validate(file)
      if (err) {
        setLastError(err)
        return
      }
      setLastError(null)
      onFile(file)
    },
    [onFile, validate],
  )

  return (
    <div className="space-y-2">
      <label
        onDragEnter={(e) => {
          if (disabled) return
          e.preventDefault()
          setIsOver(true)
        }}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={(e) => {
          if (disabled) return
          e.preventDefault()
          setIsOver(false)
        }}
        onDrop={(e) => {
          if (disabled) return
          e.preventDefault()
          setIsOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center transition focus-within:ring-2 focus-within:ring-indigo-500/50 hover:bg-zinc-950/60',
          isOver ? 'border-indigo-500/50 bg-indigo-500/10' : '',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        )}
      >
        <input
          className="sr-only"
          type="file"
          accept={acceptAttr}
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <FileUp className="h-5 w-5 text-zinc-300" />
        <div className="text-sm font-medium text-zinc-50">Drag & drop your syllabus</div>
        <div className="text-xs text-zinc-400">PDF or DOCX • up to 25MB</div>
      </label>

      {lastError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          <div>{lastError}</div>
        </div>
      ) : (
        <div className="text-[11px] text-zinc-500">
          Tip: if your syllabus is scanned (images), export it with OCR first.
        </div>
      )}
    </div>
  )
}

