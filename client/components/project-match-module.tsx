"use client"

import { useState, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useApiKeys } from "@/contexts/api-keys-context"
import { useAuth } from "@/contexts/auth-context"
import * as XLSX from "xlsx"

interface MatchRow {
  inputDescription: string
  matches: { code?: string; description?: string; unit?: string; unitRate?: number; confidence?: number; engine?: string }[]
  quantity?: number
  selected: number
  engine: string
  code: string
  matchDesc: string
  unit: string
  rate: number | ''
  confidence: number | ''
  qty: number | ''
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function ProjectMatchModule(){
  const { openaiKey, cohereKey, geminiKey } = useApiKeys()
  const { token } = useAuth()
  const [rows,setRows] = useState<MatchRow[]>([])
  const [loading,setLoading] = useState(false)
  const [progress,setProgress] = useState(0)
  const [workbook,setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const {getRootProps,getInputProps,open,isDragActive} = useDropzone({
    onDrop:(accepted)=>{if(accepted&&accepted[0]) handleFile(accepted[0])},
    noClick:true,
    noKeyboard:true,
    multiple:false
  })

  async function handleFile(file:File){
    const array = await file.arrayBuffer()
    setWorkbook(XLSX.read(array))
    const form = new FormData()
    form.append('file',file)
    if(openaiKey) form.append('openaiKey',openaiKey)
    if(cohereKey) form.append('cohereKey',cohereKey)
    if(geminiKey) form.append('geminiKey',geminiKey)
    setLoading(true)
    setProgress(0)
    timerRef.current = setInterval(()=>setProgress(p=>p<90?p+5:90),500)
    try{
      if(!token) throw new Error('No auth')
      const res = await fetch(`${API_URL}/api/match`,{
        method:'POST',
        headers:{ Authorization: `Bearer ${token}` },
        body:form
      })
      if(!res.ok) throw new Error('Match failed')
      const data = await res.json()
      const formatted:MatchRow[] = data.map((r:any)=>{
        const matches = (r.matches||[]).filter((m:any)=>m.unit&&String(m.unit).trim()!==''&&m.unitRate!==null&&m.unitRate!==undefined)
        const first = matches[0]||{}
        return {
          ...r,
          matches,
          selected:0,
          qty:r.quantity||0,
          engine:r.engine||first.engine||'',
          code:first.code||'',
          matchDesc:first.description||'',
          unit:first.unit||'',
          rate:first.unitRate??'',
          confidence:first.confidence??''
        }
      })
      setRows(formatted)
    }catch(err){
      console.error(err)
    }finally{
      clearInterval(timerRef.current)
      setProgress(100)
      setLoading(false)
      setTimeout(()=>setProgress(0),500)
    }
  }

  function rowTotal(r:MatchRow){
    const q=parseFloat(String(r.qty))||0
    const rate=parseFloat(String(r.rate))||0
    return q*rate
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Project Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${isDragActive?'bg-white/5 border-white/40':'border-white/20 hover:border-white/40'}`}>        
          <input {...getInputProps()} accept=".xls,.xlsx" />
          <p className="text-gray-400 mb-4">Drag & drop an Excel file here</p>
          <Button type="button" onClick={open} className="bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-black font-semibold">Browse file</Button>
        </div>
        {loading && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        )}
        {rows.length>0 && (
          <div className="overflow-auto max-h-[60vh]">
            <Table className="min-w-full text-xs">
              <TableHeader className="sticky top-0 bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Match</TableHead>
                  <TableHead className="text-white">Qty</TableHead>
                  <TableHead className="text-white">Rate</TableHead>
                  <TableHead className="text-white">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r,i)=>(
                  <TableRow key={i} className="border-b border-white/10">
                    <TableCell className="text-white">{r.inputDescription}</TableCell>
                    <TableCell className="text-white">{r.matchDesc}</TableCell>
                    <TableCell className="text-white">{r.qty}</TableCell>
                    <TableCell className="text-white">{r.rate}</TableCell>
                    <TableCell className="text-white">{rowTotal(r).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right text-white font-semibold">Total</TableCell>
                  <TableCell className="text-white font-semibold">{rows.reduce((s,r)=>s+rowTotal(r),0).toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
