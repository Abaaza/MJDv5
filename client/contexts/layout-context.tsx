"use client"

import { createContext, useContext } from "react"

interface LayoutContextType {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
})

export const useLayout = () => useContext(LayoutContext)
