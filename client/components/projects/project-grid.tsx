"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Download, Filter, Search } from "lucide-react"
import Link from "next/link"
import { useMobileOptimization } from "@/hooks/use-mobile-optimization"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface ProjectData {
  id: string
  client: string
  project: string
  value: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  date: string
  items: number
}

const mockProjects: ProjectData[] = [
  {
    id: "QT-2024-001",
    client: "Metro Construction Ltd.",
    project: "Downtown Office Complex",
    value: "$1,250,000",
    status: "pending",
    date: "2024-01-15",
    items: 45,
  },
  {
    id: "QT-2024-002",
    client: "Urban Developers Inc.",
    project: "Residential Tower Phase 2",
    value: "$890,000",
    status: "in-progress",
    date: "2024-01-12",
    items: 32,
  },
  {
    id: "QT-2024-003",
    client: "City Infrastructure",
    project: "Bridge Renovation Project",
    value: "$2,100,000",
    status: "completed",
    date: "2024-01-10",
    items: 67,
  },
  {
    id: "QT-2024-004",
    client: "Green Building Corp.",
    project: "Sustainable Office Park",
    value: "$750,000",
    status: "rejected",
    date: "2024-01-08",
    items: 28,
  },
  {
    id: "QT-2024-005",
    client: "Industrial Solutions",
    project: "Manufacturing Facility",
    value: "$1,800,000",
    status: "in-progress",
    date: "2024-01-05",
    items: 89,
  },
  {
    id: "QT-2024-006",
    client: "Retail Spaces LLC",
    project: "Shopping Center Expansion",
    value: "$950,000",
    status: "pending",
    date: "2024-01-03",
    items: 41,
  },
]

export const ProjectDataGrid = memo(function ProjectDataGrid() {
  const { isMobile } = useMobileOptimization()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleProjects, setVisibleProjects] = useState<ProjectData[]>(mockProjects)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced search function
  const debouncedSearch = useDebounce((term: string, status: string) => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockProjects.filter((project) => {
        const matchesSearch =
          project.client.toLowerCase().includes(term.toLowerCase()) ||
          project.project.toLowerCase().includes(term.toLowerCase()) ||
          project.id.toLowerCase().includes(term.toLowerCase())
        const matchesStatus = status === "all" || project.status === status
        return matchesSearch && matchesStatus
      })

      setVisibleProjects(filtered)
      setIsLoading(false)
    }, 300)
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm, statusFilter)
  }, [searchTerm, statusFilter, debouncedSearch])

  const getStatusBadge = useCallback((status: string) => {
    const statusClasses = {
      pending: "status-pending",
      "in-progress": "status-in-progress",
      completed: "status-completed",
      rejected: "status-rejected",
    }

    return (
      <Badge className={`${statusClasses[status as keyof typeof statusClasses]} border rounded-full px-3 py-1`}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }, [])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="glass-effect border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <ProjectDataGridSkeleton />}

      {/* Grid */}
      {!isLoading && (
        <>
          {visibleProjects.length === 0 ? (
            <EmptyState
              onClearFilters={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map((project) => (
                <ProjectDataCard
                  key={project.id}
                  project={project}
                  getStatusBadge={getStatusBadge}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
})

// Memoized project card component
const ProjectDataCard = memo(function ProjectDataCard({
  project,
  getStatusBadge,
  isMobile,
}: {
  project: ProjectData
  getStatusBadge: (status: string) => JSX.Element
  isMobile: boolean
}) {
  return (
    <Card
      className={cn(
        "glass-effect border-white/10 hover:border-white/20 transition-all duration-300 group",
        !isMobile && "hover:scale-105",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white truncate">{project.id}</h3>
          {getStatusBadge(project.status)}
        </div>
        <p className="text-sm text-gray-400">{project.date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-white">{project.client}</p>
          <p className="text-sm text-gray-400 truncate">{project.project}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold neon-blue">{project.value}</p>
            <p className="text-xs text-gray-400">{project.items} items</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple mobile-touch"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 ripple mobile-touch">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 ripple mobile-touch">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

// Loading skeleton component
const ProjectDataGridSkeleton = memo(function ProjectDataGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="glass-effect border-white/10 animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-white/10 rounded w-1/3"></div>
              <div className="h-5 bg-white/10 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-white/10 rounded w-1/4 mt-2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-8 bg-white/10 rounded w-1/3"></div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <div className="h-9 bg-white/10 rounded flex-1"></div>
              <div className="h-9 bg-white/10 rounded w-9"></div>
              <div className="h-9 bg-white/10 rounded w-9"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

// Empty state component
const EmptyState = memo(function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
      <p className="text-gray-400 max-w-md">
        We couldn't find any projects matching your search criteria. Try adjusting your filters or search term.
      </p>
      <Button className="mt-6 bg-white/10 hover:bg-white/20 text-white" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  )
})
