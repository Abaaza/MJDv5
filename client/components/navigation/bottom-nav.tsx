"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Upload, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileOptimization } from "@/hooks/use-mobile-optimization"
import { memo } from "react"

const navItems = [
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname()
  const { safeAreaBottom } = useMobileOptimization()

  return (
    <nav className="mobile-bottom-nav" style={{ paddingBottom: safeAreaBottom }}>
      {navItems.map((item) => (
        <NavItem key={item.name} item={item} isActive={pathname === item.href} />
      ))}
    </nav>
  )
})

// Memoized nav item component
const NavItem = memo(function NavItem({
  item,
  isActive,
}: {
  item: { name: string; href: string; icon: React.ElementType }
  isActive: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
        isActive ? "text-[#00D4FF]" : "text-gray-400",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className={cn("h-5 w-5 mb-1", isActive ? "neon-blue" : "text-gray-400")} />
      <span>{item.name}</span>
    </Link>
  )
})
