"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { memo } from "react"

interface ClientDrawerProps {
  open: boolean
  onClose: () => void
  client: string
}

export const ClientDrawer = memo(function ClientDrawer({ open, onClose, client }: ClientDrawerProps) {
  // Mock client data
  const clientData = {
    name: client,
    type: "Construction Company",
    email: "contact@metroconstruction.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business District, Metro City, MC 12345",
    established: "2015",
    totalProjects: 47,
    totalValue: "$12.5M",
    status: "Premium Client",
    recentProjects: [
      { name: "Downtown Office Complex", value: "$1,250,000", status: "In Progress" },
      { name: "Retail Plaza Phase 1", value: "$890,000", status: "Completed" },
      { name: "Warehouse Facility", value: "$650,000", status: "Completed" },
    ],
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] glass-effect border-white/10 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl">Client Information</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Client Overview */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2 neon-blue" />
                  {clientData.name}
                </CardTitle>
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30">{clientData.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-400">{clientData.type}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-white">{clientData.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-white">{clientData.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-white">{clientData.address}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-white">Established {clientData.established}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-effect border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold neon-blue">{clientData.totalProjects}</div>
                <div className="text-sm text-gray-400">Total Projects</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold neon-green">{clientData.totalValue}</div>
                <div className="text-sm text-gray-400">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientData.recentProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-white font-medium">{project.name}</p>
                    <p className="text-sm text-gray-400">{project.value}</p>
                  </div>
                  <Badge
                    className={
                      project.status === "Completed"
                        ? "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30"
                        : "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button className="flex-1 bg-gradient-to-r from-[#00D4FF] to-[#00FF88] hover:from-[#00D4FF]/80 hover:to-[#00FF88]/80 text-black font-semibold ripple">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" className="border-white/20 hover:bg-white/10 ripple">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
})
