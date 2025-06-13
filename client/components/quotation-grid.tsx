"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Download, Filter, Search, Trash } from "lucide-react"
import Link from "next/link"
import { useMobileOptimization } from "@/components/mobile-optimization-provider"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { loadQuotations, deleteQuotation } from "@/lib/quotation-store"

interface Quotation {
  id: string
  client: string
  project: string
  value: string
  status: string
  date: string
  items: number
}

export function QuotationGrid() {
  const { isMobile } = useMobileOptimization()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [visibleQuotations, setVisibleQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadQuotations().then(raw => {
      const stored = raw.map(q => ({
        id: q.id,
        client: q.client,
        project: q.project,
        value: formatCurrency(q.value),
        status: q.status,
        date: formatDate(q.date),
        items: q.items.length
      }))
      setQuotations(stored)
      setVisibleQuotations(stored)
    })
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string, status: string) => {
      setIsLoading(true)

      // Simulate API call delay - reduced for better UX
      setTimeout(() => {
        const filtered = quotations.filter((quotation) => {
          const matchesSearch =
            quotation.client.toLowerCase().includes(term.toLowerCase()) ||
            quotation.project.toLowerCase().includes(term.toLowerCase()) ||
            quotation.id.toLowerCase().includes(term.toLowerCase())
          const matchesStatus = status === "all" || quotation.status === status
          return matchesSearch && matchesStatus
        })

        setVisibleQuotations(filtered)
        setIsLoading(false)
      }, 150) // Reduced from 300ms to 150ms
    }, 300),
    [quotations],
  )

  useEffect(() => {
    if (searchTerm || statusFilter !== "all") {
      debouncedSearch(searchTerm, statusFilter)
    } else {
      setVisibleQuotations(quotations)
      setIsLoading(false)
    }

    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, statusFilter, debouncedSearch, quotations])

  const getStatusBadge = (status: string) => {
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
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Delete this quotation?')
    if (!confirm) return
    await deleteQuotation(id)
    setQuotations(prev => prev.filter(q => q.id !== id))
    setVisibleQuotations(prev => prev.filter(q => q.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search quotations..."
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
      {isLoading && (
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
      )}

      {/* Grid */}
      {!isLoading && (
        <>
          {visibleQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No quotations found</h3>
              <p className="text-gray-400 max-w-md">
                We couldn't find any quotations matching your search criteria. Try adjusting your filters or search
                term.
              </p>
              <Button
                className="mt-6 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleQuotations.map((quotation) => (
                <Card
                  key={quotation.id}
                  className={cn(
                    "glass-effect border-white/10 hover:border-white/20 transition-all duration-300 group",
                    !isMobile && "hover:scale-105",
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white truncate">{quotation.id}</h3>
                      {getStatusBadge(quotation.status)}
                    </div>
                    <p className="text-sm text-gray-400">{quotation.date}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-white">{quotation.client}</p>
                      <p className="text-sm text-gray-400 truncate">{quotation.project}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold neon-blue">{quotation.value}</p>
                        <p className="text-xs text-gray-400">{quotation.items} items</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/quotations/${quotation.id}`} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple mobile-touch"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/quotations/${quotation.id}?edit=true`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 hover:bg-white/10 ripple mobile-touch"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/quotations/${quotation.id}?download=true`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 hover:bg-white/10 ripple mobile-touch"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(quotation.id)}
                        className="border-red-500/30 text-red-500 hover:bg-red-500/20 ripple mobile-touch"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout)
  }

  return debounced
}
