"use client"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/register") {
      router.replace("/login")
    }
  }, [user, pathname, router])

  if (!user && pathname !== "/login" && pathname !== "/register") {
    return null
  }

  return <>{children}</>
}
