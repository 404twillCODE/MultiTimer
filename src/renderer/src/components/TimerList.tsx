import { useState, useCallback, useEffect } from 'react'
import { formatDuration, parseDuration, toSeconds } from '../utils/time'
import './TimerList.css'

export interface TimerItem {
  id: number
  durationSeconds: number
}

interface TimerListProps {
  timers: TimerItem[]
  currentIndex: number
  isRunning: boolean
  onRemove: (id: number) => void
  onEdit: (id: number, seconds: number) => void
  canEdit: boolean
}

export function TimerList({
  timers,
  currentIndex,
  isRunning,
  onRemove,
  onEdit,
  canEdit,
}: TimerListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editHrs, setEditHrs] = useState('')
  const [editMins, setEditMins] = useState('')
  const [editSecs, setEditSecs] = useState('')

  const startEditing = useCallback((t: TimerItem) => {
    const { hours, minutes, seconds } = parseDuration(t.durationSeconds)
    setEditingId(t.id)
    setEditHrs(hours > 0 ? String(hours) : '')
    setEditMins(String(minutes))
    setEditSecs(String(seconds))
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingId(null)
    setEditHrs('')
    setEditMins('')
    setEditSecs('')
  }, [])

  const saveEditing = useCallback(() => {
    if (editingId === null) return
    const total = toSeconds(editHrs, editMins, editSecs)
    if (total <= 0) return
    onEdit(editingId, total)
    setEditingId(null)
    setEditHrs('')
    setEditMins('')
    setEditSecs('')
  }, [editingId, editHrs, editMins, editSecs, onEdit])

  useEffect(() => {
    if (!canEdit) setEditingId(null)
  }, [canEdit])

  if (timers.length === 0) return null

  return (
    <div className="timer-list-wrapper">
      <ul className="timer-list">
      {timers.map((t, i) => {
        const isActive = i === currentIndex && isRunning
        const isDone = i < currentIndex
        const isEditing = editingId === t.id

        return (
          <li
            key={t.id}
            className={`timer-list-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isEditing ? 'editing' : ''}`}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <span className="timer-list-num">{i + 1}</span>

            {isEditing ? (
              <div className="timer-list-edit">
                <input
                  type="number"
                  className="timer-list-edit-input timer-list-edit-hr"
                  min={0}
                  max={99}
                  placeholder="Hr"
                  value={editHrs}
                  onChange={(e) => setEditHrs(e.target.value)}
                  autoFocus
                />
                <span className="timer-list-sep">:</span>
                <input
                  type="number"
                  className="timer-list-edit-input"
                  min={0}
                  max={59}
                  placeholder="Min"
                  value={editMins}
                  onChange={(e) => setEditMins(e.target.value)}
                />
                <span className="timer-list-sep">:</span>
                <input
                  type="number"
                  className="timer-list-edit-input"
                  min={0}
                  max={59}
                  placeholder="Sec"
                  value={editSecs}
                  onChange={(e) => setEditSecs(e.target.value)}
                />
                <button
                  type="button"
                  className="timer-list-save"
                  onClick={saveEditing}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="timer-list-cancel-edit"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="timer-list-duration"
                  onClick={() => canEdit && startEditing(t)}
                  disabled={!canEdit}
                >
                  {formatDuration(t.durationSeconds)}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="timer-list-remove"
                    onClick={() => onRemove(t.id)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </li>
        )
      })}
      </ul>
    </div>
  )
}
