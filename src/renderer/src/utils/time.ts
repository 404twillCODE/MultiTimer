/** Format seconds as H:MM:SS or M:SS (no leading zero on first segment) */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Parse seconds into { hours, minutes, seconds } */
export function parseDuration(seconds: number): { hours: number; minutes: number; seconds: number } {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return { hours, minutes, seconds: secs }
}

/** Parse H, M, S inputs (empty = 0) to total seconds. Clamps mins/secs to 0-59. */
export function toSeconds(hrs: string, mins: string, secs: string): number {
  const h = Math.max(0, parseInt(hrs, 10) || 0)
  const m = Math.max(0, Math.min(59, parseInt(mins, 10) || 0))
  const s = Math.max(0, Math.min(59, parseInt(secs, 10) || 0))
  return h * 3600 + m * 60 + s
}
