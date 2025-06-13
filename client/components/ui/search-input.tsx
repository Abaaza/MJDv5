"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, memo } from "react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchInputProps {
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
}

export const SearchInput = memo(function SearchInput({
  placeholder = "Search quotations...",
  onChange,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState("")

  // Use debounced callback for search
  const debouncedOnChange = useDebounce((searchValue: string) => {
    if (onChange) onChange(searchValue)
  }, 300)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      debouncedOnChange(newValue)
    },
    [debouncedOnChange],
  )

  return (
    <>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-48 md:w-64 pl-10 bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20 ${className}`}
        aria-label="Search"
      />
    </>
  )
})
