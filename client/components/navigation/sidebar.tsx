"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Upload, Users, Settings, BarChart3, CircleDollarSign, ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useCallback, memo } from "react"
import { useMobileOptimization } from "@/hooks/use-mobile-optimization"
import { useLayout } from "@/contexts/layout-context"
import { Logo } from "@/components/ui/logo"
import { UserProfile } from "@/components/user/user-profile"
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"

const navigation = [
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Price List", href: "/price-list", icon: CircleDollarSign },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname()
  const { isMobile, isIOS, isAndroid } = useMobileOptimization()
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, closeSidebar } = useLayout()

  // Handle swipe gestures for mobile
  const handleSwipeLeft = useCallback(() => {
    if (sidebarOpen) closeSidebar()
  }, [sidebarOpen, closeSidebar])

  const handleSwipeRight = useCallback(() => {
    if (!sidebarOpen) toggleSidebar()
  }, [sidebarOpen, toggleSidebar])

  const { touchHandlers } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
  })

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      closeSidebar()
    }
  }, [pathname, isMobile, closeSidebar])

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closeSidebar} {...touchHandlers} />
        )}

        {/* Mobile sidebar */}
        <div
          id="mobile-sidebar"
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-[280px] glass-effect border-r border-white/10 transition-transform duration-300 ease-out safe-top",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            isIOS ? "is-ios" : "",
            isAndroid ? "is-android" : "",
          )}
          {...touchHandlers}
        >
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <Logo collapsed={false} />
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
                className="h-10 w-10 hover:bg-white/10 ripple mobile-touch"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <NavItems pathname={pathname} collapsed={false} onClick={closeSidebar} />

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
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <Logo collapsed={sidebarCollapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 hover:bg-white/10 ripple"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")}
            />
          </Button>
        </div>

        {/* Navigation */}
        <NavItems pathname={pathname} collapsed={sidebarCollapsed} />

        {/* User Profile */}
        {!sidebarCollapsed && (
          <div className="border-t border-white/10 p-4">
            <UserProfile collapsed={sidebarCollapsed} />
          </div>
        )}
      </div>
    </div>
  )
})

// Memoized navigation items component
const NavItems = memo(function NavItems({
  pathname,
  collapsed,
  onClick,
}: {
  pathname: string
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <nav className="flex-1 space-y-1 p-4 overflow-y-auto allow-scroll">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ripple mobile-touch",
              isActive
                ? "bg-gradient-to-r from-[#00D4FF]/20 to-[#00FF88]/20 text-white glow-blue"
                : "text-gray-400 hover:bg-white/10 hover:text-white",
              collapsed && "justify-center",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon
              className={cn(
                collapsed ? "h-6 w-6" : "h-5 w-5",
                "flex-shrink-0",
                isActive && "neon-blue"
              )}
            />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        )
      })}
    </nav>
  )
})
