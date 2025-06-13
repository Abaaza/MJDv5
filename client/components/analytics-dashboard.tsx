"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from "lucide-react"
import { loadQuotations } from "@/lib/quotation-store"
import { formatCurrency } from "@/lib/utils"

interface Metric {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: any
}

interface DistributionItem {
  name: string
  value: number
  color: string
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [distribution, setDistribution] = useState<DistributionItem[]>([])
  const [activity, setActivity] = useState<string[]>([])

  useEffect(() => {
    loadQuotations().then(qs => {
      const now = new Date()
      const monthlyTotal = qs
        .filter(q => {
          const d = new Date(q.date)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((s, q) => s + q.value, 0)

      const clients = new Set(qs.map(q => q.client))

      const statusCount: Record<string, number> = {}
      qs.forEach(q => {
        statusCount[q.status] = (statusCount[q.status] || 0) + 1
      })
      const total = qs.length || 1
      const colors = ["#00D4FF", "#00FF88", "#FF6B35", "#FACC15"]
      const dist = Object.entries(statusCount).map(([name, cnt], idx) => ({
        name,
        value: Math.round((cnt / total) * 100),
        color: colors[idx % colors.length]
      }))

      setDistribution(dist)

      setMetrics([
        {
          title: "Monthly Revenue",
          value: formatCurrency(monthlyTotal),
          trend: "up",
          change: "",
          icon: DollarSign
        },
        {
          title: "Quotations Sent",
          value: String(qs.length),
          trend: "up",
          change: "",
          icon: FileText
        },
        {
          title: "Active Clients",
          value: String(clients.size),
          trend: "up",
          change: "",
          icon: Users
        },
        {
          title: "Pending Quotations",
          value: String(statusCount["pending"] || 0),
          trend: "up",
          change: "",
          icon: Clock
        }
      ])

      const recent = qs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(q => `Quotation ${q.id} created for ${q.client}`)
      setActivity(recent)
    })
  }, [])
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 neon-green mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${metric.trend === "up" ? "neon-green" : "text-red-400"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#00D4FF]/20 glow-blue">
                  <metric.icon className="h-6 w-6 neon-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Types Distribution */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project Types Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {distribution.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{type.name}</span>
                  <span className="text-gray-400">{type.value}%</span>
                </div>
                <Progress value={type.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {activity.map((msg, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                  <div className="w-2 h-2 bg-[#00FF88] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
