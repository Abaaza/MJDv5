"use client"

import { useRef, useCallback } from "react"

interface UseDoubleTapOptions {
  onDoubleTap: () => void
  onSingleTap?: () => void
  delay?: number
}

export function useDoubleTap({ onDoubleTap, onSingleTap, delay = 300 }: UseDoubleTapOptions) {
  const lastTap = useRef<number>(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = useCallback(() => {
    const now = Date.now()
    const timeDiff = now - lastTap.current

    // Clear any existing single tap timer
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    if (timeDiff < delay && timeDiff > 0) {
      // Double tap detected
      onDoubleTap()
      lastTap.current = 0
    } else {
      // Potential single tap
      lastTap.current = now

      if (onSingleTap) {
        timer.current = setTimeout(() => {
          onSingleTap()
          timer.current = null
        }, delay)
      }
    }
  }, [onDoubleTap, onSingleTap, delay])

  return handleTap
}
