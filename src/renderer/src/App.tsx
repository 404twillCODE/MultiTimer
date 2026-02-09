import { useState, useCallback, useEffect, useRef } from 'react'
import { TitleBar } from './components/TitleBar'
import { CircularTimer } from './components/CircularTimer'
import { AddTimer } from './components/AddTimer'
import { TimerList, type TimerItem } from './components/TimerList'
import { formatDuration } from './utils/time'
import './App.css'

function getTotalSeconds(timers: TimerItem[]): number {
  return timers.reduce((sum, t) => sum + t.durationSeconds, 0)
}

/** Total remaining from current timer onward (current remaining + all following) */
function getTotalRemaining(
  timers: TimerItem[],
  currentIndex: number,
  remainingInCurrent: number
): number {
  let sum = remainingInCurrent
  for (let i = currentIndex + 1; i < timers.length; i++) {
    sum += timers[i].durationSeconds
  }
  return sum
}

const TICK_MS = 80

function playAlarmTone(): void {
  try {
    const audioCtx = new AudioContext()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => undefined)
    }
    const now = audioCtx.currentTime
    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.03)
    gain.connect(audioCtx.destination)

    const beeps = [
      { freq: 880, start: 0, duration: 0.18 },
      { freq: 660, start: 0.22, duration: 0.18 },
      { freq: 880, start: 0.44, duration: 0.18 },
      { freq: 660, start: 0.66, duration: 0.22 },
    ]

    beeps.forEach((b) => {
      const osc = audioCtx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(b.freq, now + b.start)
      osc.connect(gain)
      osc.start(now + b.start)
      osc.stop(now + b.start + b.duration)
    })

    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    setTimeout(() => {
      audioCtx.close().catch(() => undefined)
    }, 1500)
  } catch {
    // ignore audio errors
  }
}

export default function App() {
  const [timers, setTimers] = useState<TimerItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [remainingInCurrent, setRemainingInCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextIdRef = useRef(1)
  const timersRef = useRef<TimerItem[]>(timers)
  const currentIndexRef = useRef(0)
  const endTimestampRef = useRef(0)
  const pauseStartedRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  timersRef.current = timers
  currentIndexRef.current = currentIndex
  isPausedRef.current = isPaused

  const canEdit = !isRunning

  const currentTimer = timers[currentIndex] ?? null
  const totalSeconds = getTotalSeconds(timers)
  const totalRemaining = getTotalRemaining(timers, currentIndex, remainingInCurrent)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setIsPaused(false)
    pauseStartedRef.current = null
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const tick = () => {
      if (isPausedRef.current) return
      const list = timersRef.current
      const idx = currentIndexRef.current
      const now = Date.now()
      const rem = Math.max(0, (endTimestampRef.current - now) / 1000)

      if (rem <= 0) {
        const label = list[idx]
          ? `Timer ${idx + 1} (${formatDuration(list[idx].durationSeconds)})`
          : `Timer ${idx + 1}`
        window.electronAPI?.showNotification('Timer done', `${label} finished.`)
        playAlarmTone()
        if (idx + 1 >= list.length) {
          stop()
          window.electronAPI?.showNotification('All done', 'All timers have finished.')
          playAlarmTone()
          setCurrentIndex(0)
          setRemainingInCurrent(0)
          return
        }
        const next = list[idx + 1]
        const nextDuration = next?.durationSeconds ?? 0
        endTimestampRef.current = Date.now() + nextDuration * 1000
        currentIndexRef.current = idx + 1
        setCurrentIndex(idx + 1)
        setRemainingInCurrent(nextDuration)
        return
      }
      setRemainingInCurrent(rem)
    }
    intervalRef.current = setInterval(tick, TICK_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, stop])

  const handleAdd = useCallback((seconds: number) => {
    setTimers((prev) => [
      ...prev,
      { id: nextIdRef.current++, durationSeconds: seconds },
    ])
  }, [])

  const handleRemove = useCallback((id: number) => {
    if (!canEdit) return
    setTimers((prev) => prev.filter((t) => t.id !== id))
  }, [canEdit])

  const handleEdit = useCallback((id: number, seconds: number) => {
    if (!canEdit) return
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durationSeconds: seconds } : t))
    )
  }, [canEdit])

  const handleStart = useCallback(() => {
    if (timers.length === 0) return
    const first = timers[0].durationSeconds
    endTimestampRef.current = Date.now() + first * 1000
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setRemainingInCurrent(first)
    setIsPaused(false)
    setIsRunning(true)
  }, [timers])

  const handlePause = useCallback(() => {
    setIsPaused((p) => {
      if (!p) {
        pauseStartedRef.current = Date.now()
        return true
      }
      if (pauseStartedRef.current !== null) {
        const pausedFor = Date.now() - pauseStartedRef.current
        endTimestampRef.current += pausedFor
        pauseStartedRef.current = null
      }
      return false
    })
  }, [])

  const handleReset = useCallback(() => {
    stop()
    setCurrentIndex(0)
    setRemainingInCurrent(0)
    currentIndexRef.current = 0
    pauseStartedRef.current = null
  }, [stop])

  const displayRemaining =
    currentTimer && isRunning ? remainingInCurrent : currentTimer?.durationSeconds ?? 0
  const displayTotal = currentTimer ? currentTimer.durationSeconds : 0
  const displayLabel = currentTimer
    ? `Timer ${currentIndex + 1}`
    : timers.length > 0
      ? 'Ready'
      : 'Add timers below'

  return (
    <div className="app">
      <TitleBar />
      <main className="main">
        <section className="hero">
          <CircularTimer
            remainingSeconds={displayRemaining}
            totalSeconds={displayTotal}
            isRunning={isRunning && !isPaused}
            label={displayLabel}
          />
        </section>

        <section className="total-row">
          <span className="total-label">
            {isRunning ? 'Remaining' : 'Total'}
          </span>
          <span className="total-value">
            {formatDuration(isRunning ? Math.ceil(totalRemaining) : totalSeconds)}
          </span>
        </section>

        <section className="controls">
          <button
            type="button"
            className="btn btn-start"
            onClick={handleStart}
            disabled={timers.length === 0 || isRunning}
          >
            Start
          </button>
          <button
            type="button"
            className="btn btn-pause"
            onClick={handlePause}
            disabled={!isRunning}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" className="btn btn-reset" onClick={handleReset}>
            Reset
          </button>
        </section>

        <AddTimer onAdd={handleAdd} disabled={false} />

        <section className="timers-section">
          <h2 className="timers-section-title">Timers</h2>
          <TimerList
            timers={timers}
            currentIndex={currentIndex}
            isRunning={isRunning && !isPaused}
            onRemove={handleRemove}
            onEdit={handleEdit}
            canEdit={canEdit}
          />
        </section>
      </main>
    </div>
  )
}
