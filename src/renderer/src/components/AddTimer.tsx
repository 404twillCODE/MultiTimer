import { useState, useCallback } from 'react'
import { toSeconds } from '../utils/time'
import './AddTimer.css'

const PRESETS = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
]

interface AddTimerProps {
  onAdd: (seconds: number) => void
  disabled?: boolean
}

export function AddTimer({ onAdd, disabled }: AddTimerProps) {
  const [customHrs, setCustomHrs] = useState('')
  const [customMins, setCustomMins] = useState('')
  const [customSecs, setCustomSecs] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handlePreset = useCallback(
    (seconds: number) => {
      if (disabled) return
      onAdd(seconds)
    },
    [onAdd, disabled]
  )

  const handleCustom = useCallback(() => {
    const total = toSeconds(customHrs, customMins, customSecs)
    if (total <= 0) return
    onAdd(total)
    setCustomHrs('')
    setCustomMins('')
    setCustomSecs('')
    setShowCustom(false)
  }, [onAdd, customHrs, customMins, customSecs])

  const toggleCustom = useCallback(() => {
    setShowCustom((v) => !v)
    if (!showCustom) {
      setCustomHrs('')
      setCustomMins('')
      setCustomSecs('')
    }
  }, [showCustom])

  return (
    <div className="add-timer">
      <p className="add-timer-title">Add timer</p>
      <div className="add-timer-presets">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            className="add-timer-preset"
            onClick={() => handlePreset(p.value)}
            disabled={disabled}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="add-timer-custom">
        {!showCustom ? (
          <button
            type="button"
            className="add-timer-custom-toggle"
            onClick={toggleCustom}
            disabled={disabled}
          >
            + Custom
          </button>
        ) : (
          <div className="add-timer-custom-row">
            <input
              type="number"
              className="add-timer-input add-timer-input-hr"
              min={0}
              max={99}
              placeholder="Hr"
              value={customHrs}
              onChange={(e) => setCustomHrs(e.target.value)}
            />
            <span className="add-timer-sep">:</span>
            <input
              type="number"
              className="add-timer-input"
              min={0}
              max={59}
              placeholder="Min"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
            />
            <span className="add-timer-sep">:</span>
            <input
              type="number"
              className="add-timer-input"
              min={0}
              max={59}
              placeholder="Sec"
              value={customSecs}
              onChange={(e) => setCustomSecs(e.target.value)}
            />
            <button
              type="button"
              className="add-timer-add-btn"
              onClick={handleCustom}
            >
              Add
            </button>
            <button
              type="button"
              className="add-timer-cancel"
              onClick={() => setShowCustom(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
