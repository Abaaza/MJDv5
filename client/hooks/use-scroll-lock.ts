"use client"

import { useEffect } from "react"

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return

    // Save initial body style
    const originalStyle = window.getComputedStyle(document.body).overflow
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Lock scroll
    document.body.style.overflow = "hidden"

    // Add padding to prevent layout shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore original style
      document.body.style.overflow = originalStyle
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [lock])
}
