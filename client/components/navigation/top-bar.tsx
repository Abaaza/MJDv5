"use client"

import { cn } from "@/lib/utils"
import { Search, Menu, Moon, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useState, useEffect, memo } from "react"
import { useMobileOptimization } from "@/hooks/use-mobile-optimization"
import { useLayout } from "@/contexts/layout-context"
import { NotificationBadge } from "@/components/notifications/notification-badge"
import { SearchInput } from "@/components/ui/search-input"

export const TopBar = memo(function TopBar() {
  const { theme, setTheme } = useTheme()
  const { isMobile, isIOS, safeAreaTop } = useMobileOptimization()
  const { toggleSidebar } = useLayout()
  const [mounted, setMounted] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Handle theme hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header
      className={cn("sticky top-0 z-30 glass-effect border-b border-white/10 h-16", isIOS && "is-ios")}
      style={{ paddingTop: isMobile ? safeAreaTop : 0 }}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-white/10 ripple mobile-touch"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop search */}
          <div className="relative hidden sm:block">
            <SearchInput />
          </div>

          {/* Mobile search expanded */}
          {isMobile && showSearch && <MobileSearchOverlay onClose={() => setShowSearch(false)} />}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile search button */}
          {isMobile && !showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="hover:bg-white/10 ripple mobile-touch"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          <ThemeToggle theme={theme} setTheme={setTheme} mounted={mounted} />
          <NotificationBadge count={7} />
        </div>
      </div>
    </header>
  )
})

// Memoized theme toggle component
const ThemeToggle = memo(function ThemeToggle({
  theme,
  setTheme,
  mounted,
}: {
  theme: string | undefined
  setTheme: (theme: string) => void
  mounted: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="hover:bg-white/10 ripple mobile-touch"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
    </Button>
  )
})

// Mobile search overlay component
const MobileSearchOverlay = memo(function MobileSearchOverlay({ onClose }: { onClose: () => void }) {
  // Focus input on mount
  useEffect(() => {
    const input = document.getElementById("mobile-search-input")
    if (input) {
      input.focus()
    }
  }, [])

  return (
    <div className="absolute inset-0 z-50 glass-effect flex items-center px-4 animate-in fade-in slide-in-from-top duration-300">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          id="mobile-search-input"
          placeholder="Search quotations..."
          className="w-full pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
          aria-label="Search quotations"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="ml-2 hover:bg-white/10 ripple mobile-touch"
        aria-label="Close search"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
})
