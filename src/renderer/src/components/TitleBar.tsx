import { useCallback } from 'react'
import './TitleBar.css'

export function TitleBar() {
  const handleMinimize = useCallback(() => {
    window.electronAPI?.minimize()
  }, [])

  const handleClose = useCallback(() => {
    window.electronAPI?.close()
  }, [])

  return (
    <header className="title-bar">
      <div className="title-bar-drag" />
      <div className="title-bar-controls">
        <button
          type="button"
          className="title-bar-btn title-bar-minimize"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none" aria-hidden>
            <path d="M0 0.5h10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          type="button"
          className="title-bar-btn title-bar-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
