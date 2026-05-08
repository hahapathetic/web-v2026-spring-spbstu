import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function Modal({
  open,
  onClose,
  children,
  width = 900,
}: {
  open: boolean
  onClose: () => void
  children?: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8,6,13,0.30)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 50,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          borderRadius: 16,
          background: '#fff',
          border: '1px solid rgba(8, 6, 13, 0.08)',
          boxShadow: '0 12px 40px rgba(8,6,13,0.18)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

