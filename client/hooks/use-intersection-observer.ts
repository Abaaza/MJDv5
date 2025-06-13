"use client"

import { useEffect, useState, useRef, type RefObject } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [boolean, RefObject<HTMLElement>] {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const frozen = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Skip if already frozen
    if (frozen.current && freezeOnceVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting

        if (isIntersecting) {
          setIsVisible(true)

          if (freezeOnceVisible) {
            frozen.current = true
            observer.disconnect()
          }
        } else {
          if (!freezeOnceVisible) {
            setIsVisible(false)
          }
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return [isVisible, elementRef]
}
