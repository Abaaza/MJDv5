"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface ApiKeyContextType {
  openaiKey: string
  cohereKey: string
  geminiKey: string
  setKeys: (keys: Partial<{openaiKey:string;cohereKey:string;geminiKey:string}>) => void
  saveKeys: () => void
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  openaiKey: "",
  cohereKey: "",
  geminiKey: "",
  setKeys: () => {},
  saveKeys: () => {}
})

export function ApiKeyProvider({children}:{children:React.ReactNode}){
  const { user } = useAuth()
  const uid = user?.id ?? 'guest'
  const [openaiKey,setOpenai] = useState("")
  const [cohereKey,setCohere] = useState("")
  const [geminiKey,setGemini] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem(`apiKeys_${uid}`)
    if(stored){
      const k = JSON.parse(stored)
      setOpenai(k.openaiKey||"")
      setCohere(k.cohereKey||"")
      setGemini(k.geminiKey||"")
    } else {
      setOpenai("")
      setCohere("")
      setGemini("")
    }
  },[uid])

  const setKeys = (keys: Partial<{openaiKey:string;cohereKey:string;geminiKey:string}>) => {
    if(keys.openaiKey!==undefined) setOpenai(keys.openaiKey)
    if(keys.cohereKey!==undefined) setCohere(keys.cohereKey)
    if(keys.geminiKey!==undefined) setGemini(keys.geminiKey)
  }

  const saveKeys = () => {
    const all = { openaiKey, cohereKey, geminiKey }
    localStorage.setItem(`apiKeys_${uid}`, JSON.stringify(all))
  }

  return (
    <ApiKeyContext.Provider value={{openaiKey,cohereKey,geminiKey,setKeys,saveKeys}}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export const useApiKeys = () => useContext(ApiKeyContext)

