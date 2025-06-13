"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ImageOptimizedProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onLoad?: () => void
  style?: React.CSSProperties
}

export function ImageOptimized({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  onLoad,
  style,
  ...props
}: ImageOptimizedProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Reset state when src changes
    setLoaded(false)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setError(true)
  }

  return (
    <div
      className={cn("relative overflow-hidden", !loaded && !error && "bg-white/5 animate-pulse", className)}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        ...style,
      }}
    >
      {!error ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          {...props}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  )
}
