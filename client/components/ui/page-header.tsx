import { memo } from "react"

interface PageHeaderProps {
  title: string
  description?: string
}

export const PageHeader = memo(function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
        {title}
      </h1>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
    </div>
  )
})
