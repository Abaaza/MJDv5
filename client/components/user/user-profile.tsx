import { memo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface UserProfileProps {
  collapsed: boolean
}

export const UserProfile = memo(function UserProfile({ collapsed }: UserProfileProps) {
  if (collapsed) {
    return null
  }

  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#00FF88] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Guest'}</p>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-white/10">
        Sign Out
      </Button>
    </div>
  )
})
