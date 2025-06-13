import { memo } from "react"

interface LogoProps {
  collapsed: boolean
}

export const Logo = memo(function Logo({ collapsed }: LogoProps) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#00FF88]/20 border border-white/10">
          <span className="text-sm font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            M
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#00FF88]/20 border border-white/10">
        <span className="text-lg font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
          MJD
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
          MJD
        </span>
        <span className="text-xs text-gray-400 -mt-1">Construction</span>
      </div>
    </div>
  )
})
