"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, Mail, Phone, MapPin, Eye } from "lucide-react"
import { loadQuotations } from "@/lib/quotation-store"
import { formatCurrency } from "@/lib/utils"


interface ClientInfo {
  id: number
  name: string
  projects: number
  totalValue: string
  status: string
  type?: string
  email?: string
  phone?: string
  address?: string
}

export function ClientsGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<ClientInfo[]>([])

  useEffect(() => {
    loadQuotations().then(qs => {
      const map = new Map<string, { projects: number; total: number }>()
      qs.forEach(q => {
        const info = map.get(q.client) || { projects: 0, total: 0 }
        info.projects += 1
        info.total += q.value
        map.set(q.client, info)
      })
      const arr: ClientInfo[] = Array.from(map.entries()).map(([name, info], idx) => ({
        id: idx + 1,
        name,
        projects: info.projects,
        totalValue: formatCurrency(info.total),
        status: "Active"
      }))
      setClients(arr)
    })
  }, [])

  const filteredClients = clients.filter(
    client => client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="glass-effect border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 neon-blue" />
                  <h3 className="font-semibold text-white truncate">{client.name}</h3>
                </div>
                <Badge className={client.status === "Premium" ? "status-completed" : "status-in-progress"}>
                  {client.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">{client.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm text-gray-400">{client.projects} projects</p>
                  <p className="text-lg font-bold neon-green">{client.totalValue}</p>
                </div>
              </div>

              <Button className="w-full bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
