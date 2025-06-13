import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { memo } from "react"

interface NotificationBadgeProps {
  count: number
}

export const NotificationBadge = memo(function NotificationBadge({ count }: NotificationBadgeProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-white/10 ripple mobile-touch"
      aria-label={`${count} notifications`}
    >
      <Bell className="h-5 w-5" />
      <Badge
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs p-0 flex items-center justify-center border-0"
        style={{ backgroundColor: "#FF6B35", boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" }}
      >
        {count}
      </Badge>
    </Button>
  )
})
