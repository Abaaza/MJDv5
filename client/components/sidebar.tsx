"use client"
import Link from "next/link"
import type React from "react"

import { usePathname } from "next/navigation"
import { FileText, Users, Settings, BarChart3, CircleDollarSign, ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useMobileOptimization } from "@/components/mobile-optimization-provider"
import { UserProfile } from "@/components/user/user-profile"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Price Match", href: "/price-match", icon: FileText },
  { name: "Price List", href: "/price-list", icon: CircleDollarSign },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { isMobile, isIOS, isAndroid } = useMobileOptimization()
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && !collapsed) {
      onToggle()
    } else if (isRightSwipe && collapsed) {
      onToggle()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.getElementById("mobile-sidebar")
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onToggle()
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobile, collapsed, onToggle])

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {!collapsed && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onToggle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}

        {/* Mobile sidebar */}
        <div
          id="mobile-sidebar"
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-[280px] glass-effect border-r border-white/10 transition-transform duration-300 ease-out safe-top",
            collapsed ? "-translate-x-full" : "translate-x-0",
            isIOS ? "is-ios" : "",
            isAndroid ? "is-android" : "",
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#00FF88]/20 border border-white/10">
                  <span className="text-lg font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
                    MJD
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
                    MJD
                  </span>
                  <span className="text-xs text-gray-400 -mt-1">Construction</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-10 w-10 hover:bg-white/10 ripple mobile-touch"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto allow-scroll">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ripple mobile-touch",
                      isActive
                        ? "bg-gradient-to-r from-[#00D4FF]/20 to-[#00FF88]/20 text-white glow-blue"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "neon-blue")} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-white/10 p-4 safe-bottom">
              <UserProfile collapsed={false} />
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen glass-effect border-r border-white/10 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#00FF88]/20 border border-white/10">
                <span className="text-lg font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
                  MJD
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
                  MJD
                </span>
                <span className="text-xs text-gray-400 -mt-1">Construction</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center">
              <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#00FF88]/20 border border-white/10">
                <span className="text-sm font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
                  M
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-white/10 ripple"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ripple",
                  isActive
                    ? "bg-gradient-to-r from-[#00D4FF]/20 to-[#00FF88]/20 text-white glow-blue"
                    : "text-gray-400 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className={cn(collapsed ? "h-6 w-6" : "h-5 w-5", isActive && "neon-blue")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4">
            <UserProfile collapsed={collapsed} />
          </div>
        )}
      </div>
    </div>
  )
}
