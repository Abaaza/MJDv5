"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, FileText, Clock, CheckCircle } from "lucide-react"
import { memo } from "react"

interface StatItem {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: "blue" | "orange" | "green"
  trend: "up" | "down"
}

const stats: StatItem[] = [
  {
    title: "Total Quotations",
    value: "247",
    change: "+12%",
    icon: FileText,
    color: "blue",
    trend: "up",
  },
  {
    title: "Pending Review",
    value: "18",
    change: "-5%",
    icon: Clock,
    color: "orange",
    trend: "down",
  },
  {
    title: "Completed",
    value: "189",
    change: "+8%",
    icon: CheckCircle,
    color: "green",
    trend: "up",
  },
  {
    title: "Revenue",
    value: "$2.4M",
    change: "+15%",
    icon: TrendingUp,
    color: "blue",
    trend: "up",
  },
]

export const StatsCards = memo(function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
})

const StatCard = memo(function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon

  return (
    <Card className="glass-effect border-white/10 hover:border-white/20 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{stat.title}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${stat.trend === "up" ? "neon-green" : "neon-orange"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          <div
            className={`p-3 rounded-xl ${
              stat.color === "blue"
                ? "bg-[#00D4FF]/20 glow-blue"
                : stat.color === "green"
                  ? "bg-[#00FF88]/20 glow-green"
                  : "bg-[#FF6B35]/20 glow-orange"
            } group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon
              className={`h-6 w-6 ${
                stat.color === "blue" ? "neon-blue" : stat.color === "green" ? "neon-green" : "neon-orange"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
