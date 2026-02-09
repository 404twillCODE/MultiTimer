import { useMemo } from 'react'
import { formatDuration } from '../utils/time'
import './CircularTimer.css'

const SIZE = 160
const STROKE = 6
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface CircularTimerProps {
  /** Current remaining seconds (can be fractional for smooth countdown) */
  remainingSeconds: number
  /** Total seconds for the current timer (for ring progress) */
  totalSeconds: number
  /** Whether the timer is running (for animation) */
  isRunning: boolean
  /** Label under the time, e.g. "Timer 1" */
  label?: string
}

export function CircularTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  label,
}: CircularTimerProps) {
  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0
    const elapsed = totalSeconds - remainingSeconds
    return Math.min(1, Math.max(0, elapsed / totalSeconds))
  }, [totalSeconds, remainingSeconds])

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const displaySeconds = Math.max(0, Math.floor(remainingSeconds))

  return (
    <div className="circular-timer">
      <svg
        className={`circular-timer-svg ${isRunning ? 'running' : ''}`}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        <circle
          className="circular-timer-bg"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
        />
        <circle
          className="circular-timer-fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{}}
        />
      </svg>
      <div className="circular-timer-content">
        <span
          className={`circular-timer-time ${isRunning ? 'running' : ''}`}
          key={displaySeconds}
        >
          {formatDuration(displaySeconds)}
        </span>
        {label && <span className="circular-timer-label">{label}</span>}
      </div>
    </div>
  )
}
