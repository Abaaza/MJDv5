"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"
import { memo } from "react"

interface TimelineItem {
  status: string
  date: string
  description: string
}

interface StatusTimelineProps {
  timeline: TimelineItem[]
}

export const StatusTimeline = memo(function StatusTimeline({ timeline }: StatusTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "created":
      case "uploaded":
      case "processing":
        return <CheckCircle className="h-4 w-4 neon-green" />
      case "review":
        return <Clock className="h-4 w-4 neon-orange" />
      case "approved":
        return <CheckCircle className="h-4 w-4 neon-green" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">{getStatusIcon(item.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.description}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
