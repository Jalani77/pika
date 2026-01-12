import { useContext } from 'react'
import { PikaStoreContext } from './pika-context'

export function usePika() {
  const ctx = useContext(PikaStoreContext)
  if (!ctx) throw new Error('usePika must be used within <PikaProvider>')
  return ctx
}

