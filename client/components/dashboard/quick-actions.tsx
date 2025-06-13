"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload, FileText } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

export const QuickActions = memo(function QuickActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <Link href="/upload">
        <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00D4FF] to-[#00FF88] hover:from-[#00D4FF]/80 hover:to-[#00FF88]/80 text-black font-semibold ripple glow-blue">
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel
        </Button>
      </Link>
      <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/10 ripple">
        <Plus className="h-4 w-4 mr-2" />
        New Quote
      </Button>
      <Button variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/10 ripple">
        <FileText className="h-4 w-4 mr-2" />
        Templates
      </Button>
    </div>
  )
})
