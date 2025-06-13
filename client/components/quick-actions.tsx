"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload, FileText } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="flex items-center space-x-3">
      <Link href="/upload">
        <Button className="bg-gradient-to-r from-[#00D4FF] to-[#00FF88] hover:from-[#00D4FF]/80 hover:to-[#00FF88]/80 text-black font-semibold ripple glow-blue">
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel
        </Button>
      </Link>
      <Button variant="outline" className="border-white/20 hover:bg-white/10 ripple">
        <Plus className="h-4 w-4 mr-2" />
        New Quote
      </Button>
      <Button variant="outline" className="border-white/20 hover:bg-white/10 ripple">
        <FileText className="h-4 w-4 mr-2" />
        Templates
      </Button>
    </div>
  )
}
