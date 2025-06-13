"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface MobileContextType {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isLandscape: boolean
  hasTouchScreen: boolean
  safeAreaTop: number
  safeAreaBottom: number
  safeAreaLeft: number
  safeAreaRight: number
}

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  isIOS: false,
  isAndroid: false,
  isLandscape: false,
  hasTouchScreen: false,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0,
})

export const useMobileOptimization = () => useContext(MobileContext)

export function MobileOptimizationProvider({ children }: { children: ReactNode }) {
  const [mobileState, setMobileState] = useState<MobileContextType>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isLandscape: false,
    hasTouchScreen: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
  })

  useEffect(() => {
    // Detect mobile device
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ""
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
      const isAndroid = /Android/i.test(userAgent)
      const isLandscape = window.matchMedia("(orientation: landscape)").matches
      const hasTouchScreen =
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0

      // Get safe area insets
      const safeAreaTop = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--sat") || "0",
        10,
      )
      const safeAreaBottom = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--sab") || "0",
        10,
      )
      const safeAreaLeft = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--sal") || "0",
        10,
      )
      const safeAreaRight = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--sar") || "0",
        10,
      )

      setMobileState({
        isMobile,
        isIOS,
        isAndroid,
        isLandscape,
        hasTouchScreen,
        safeAreaTop,
        safeAreaBottom,
        safeAreaLeft,
        safeAreaRight,
      })

      // Apply CSS variables for safe areas
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`)

      // Add platform-specific classes to body
      document.body.classList.toggle("is-ios", isIOS)
      document.body.classList.toggle("is-android", isAndroid)
      document.body.classList.toggle("is-mobile", isMobile)
      document.body.classList.toggle("is-landscape", isLandscape)
      document.body.classList.toggle("has-touch", hasTouchScreen)
    }

    // Initial detection
    detectMobile()

    // Set up event listeners
    window.addEventListener("resize", detectMobile)
    window.addEventListener("orientationchange", detectMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", detectMobile)
      window.removeEventListener("orientationchange", detectMobile)
    }
  }, [])

  return <MobileContext.Provider value={mobileState}>{children}</MobileContext.Provider>
}
