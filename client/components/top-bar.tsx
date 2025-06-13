"use client"

import { cn } from "@/lib/utils"

import { Bell, Search, Menu, Moon, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useMobileOptimization } from "@/components/mobile-optimization-provider"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const { isMobile, isIOS, safeAreaTop } = useMobileOptimization()
  const [mounted, setMounted] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

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
            onClick={onMenuClick}
            className="hover:bg-white/10 ripple mobile-touch"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search quotations..."
              className="w-48 md:w-64 pl-10 bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
              aria-label="Search quotations"
            />
          </div>

          {/* Mobile search expanded */}
          {isMobile && showSearch && (
            <div className="absolute inset-0 z-50 glass-effect flex items-center px-4 animate-in fade-in slide-in-from-top duration-300">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search quotations..."
                  className="w-full pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  autoFocus
                  aria-label="Search quotations"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(false)}
                className="ml-2 hover:bg-white/10 ripple mobile-touch"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-white/10 ripple mobile-touch"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/10 ripple mobile-touch"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs p-0 flex items-center justify-center border-0"
              style={{ backgroundColor: "#FF6B35", boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" }}
            >
              7
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
