"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileOptimization } from "@/components/mobile-optimization-provider"

const navItems = [
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const { safeAreaBottom } = useMobileOptimization()

  return (
    <nav className="mobile-bottom-nav" style={{ paddingBottom: safeAreaBottom }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
              isActive ? "text-[#00D4FF]" : "text-gray-400",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className={cn("h-5 w-5 mb-1", isActive ? "neon-blue" : "text-gray-400")} />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
