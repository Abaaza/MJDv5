"use client"

import { useState, useRef, memo, useEffect } from "react"
import * as XLSX from "xlsx"
import ExcelJS from "exceljs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { priceMatch, searchPriceItems, PriceItem } from "@/lib/api"
import { saveQuotation } from "@/lib/quotation-store"
import { Trash } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useApiKeys } from "@/contexts/api-keys-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchInput } from "@/components/ui/search-input"

interface MatchResult {
  inputDescription: string
  quantity: number
  matches: { description: string; unitRate: number; confidence: number; engine?: string; code?: string; unit?: string }[]
}

interface Row extends MatchResult {
  selected: number | 'manual'
  searchResults: PriceItem[]
  rateOverride?: number
}

interface PriceMatchModuleProps {
  onMatched?: () => void
}

export function PriceMatchModule({ onMatched }: PriceMatchModuleProps) {
  const { openaiKey, cohereKey, geminiKey } = useApiKeys()
  const { token } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [results, setResults] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLPreElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [textIndex, setTextIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const logSrc = useRef<EventSource | null>(null)
  const [discountInput, setDiscountInput] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [projectName, setProjectName] = useState("")
  const [clientName, setClientName] = useState("")
  const [version, setVersion] = useState<'v0' | 'v1' | 'v2'>('v0')
  const [page, setPage] = useState(0)
  const pageSize = 100
  const [inputsCollapsed, setInputsCollapsed] = useState(false)
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [headerRow, setHeaderRow] = useState<string[]>([])
  const [headerIndex, setHeaderIndex] = useState(0)
  const [colIdx, setColIdx] = useState<{desc:number; qty:number; unit:number; rate:number} | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      const reader = new FileReader()
      reader.onload = evt => {
        const data = evt.target?.result
        if (!data) return
        setFileData(data as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const idx = rows.findIndex(r =>
          r.some(c => /(description|desc|details)/i.test(String(c))) &&
          r.some(c => /(rate|price|unit\s*price|unit\s*rate)/i.test(String(c)))
        )
        if (idx !== -1) {
          setHeaderRow(rows[idx].map(String))
          setHeaderIndex(idx)
          const head = rows[idx].map((h: any) => String(h))
          const desc = head.findIndex(h => /(description|desc|details)/i.test(h))
          const qty = head.findIndex(h => /(qty|quantity|amount)/i.test(h))
          const rate = head.findIndex(h => /(rate|price|unit\s*price|unit\s*rate)/i.test(h))
          const unit = head.findIndex(h => /(unit|uom)/i.test(h))
          setColIdx({ desc, qty, unit, rate })
        }
        setWorkbook(wb)
      }
      reader.readAsArrayBuffer(f)
    }
  }

  const startIndex = results ? page * pageSize : 0
  const endIndex = results ? Math.min(results.length, startIndex + pageSize) : 0
  const pageCount = results ? Math.ceil(results.length / pageSize) : 0

  const texts = [""]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (loading) {
      setProgress(0)
      setTextIndex(0)
      interval = setInterval(() => {
        setProgress(p => {
          const next = p + 1
          if (next >= 100) {
            if (interval) clearInterval(interval)
            return 100
          }
          return next
        })
        setTextIndex(i => (i + 1) % texts.length)
      }, 1000)
    } else {
      setProgress(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loading])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const runMatch = async () => {
    if (!file) return
    if (!token) return
    setLoading(true)
    setLogs([])
    setError(null)
    const base = process.env.NEXT_PUBLIC_API_URL ?? ''
    const src = new EventSource(`${base}/api/match/logs`)
    logSrc.current = src
    src.onmessage = (e) => {
      if (e.data === 'DONE') {
        src.close()
        logSrc.current = null
      } else {
        setLogs((prev) => [...prev, e.data])
      }
    }
    try {
      const data = await priceMatch(file, { openaiKey, cohereKey, geminiKey }, token, version)
      const rows: Row[] = data.map((r: MatchResult) => ({
        ...r,
        selected: r.matches.length ? 0 : 'manual',
        searchResults: []
      }))
      setResults(rows)
      onMatched?.()
      setInputsCollapsed(true)
      if (projectName.trim() && clientName.trim()) {
        const id = await saveQuotationData(rows)
        setAutoQuoteId(id)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
      if (logSrc.current) {
        logSrc.current.close()
        logSrc.current = null
      }
    }
  }

  const updateRow = (index: number, updater: (r: Row) => Row) => {
    if (!results) return
    setResults(results.map((r, i) => (i === index ? updater({ ...r }) : r)))
  }

  const handleSelect = (index: number, value: string) => {
    updateRow(index, r => ({ ...r, selected: value === 'manual' ? 'manual' : parseInt(value, 10) }))
  }

  const handleSearch = async (index: number, q: string) => {
    if (!q) {
      updateRow(index, r => ({ ...r, searchResults: [] }))
      return
    }
    try {
      if (!token) return
      const items = await searchPriceItems(q, token)
      updateRow(index, r => ({ ...r, searchResults: items }))
    } catch (err) {
      console.error(err)
    }
  }

  const chooseManual = (rowIndex: number, item: PriceItem) => {
    updateRow(rowIndex, r => {
      const match = {
        engine: 'manual',
        code: item.code,
        description: item.description,
        unit: item.unit,
        unitRate: item.rate ?? 0,
        confidence: 1
      }
      return {
        ...r,
        matches: [...r.matches, match],
        selected: r.matches.length,
        searchResults: []
      }
    })
  }


  const PriceMatchRow = memo(function PriceMatchRow({ row, index }: { row: Row; index: number }) {
    const sel = typeof row.selected === 'number' ? row.matches[row.selected] : null
    const rate = row.rateOverride ?? sel?.unitRate ?? 0
    const total = rate * row.quantity * (1 - discount / 100)
    return (
      <tr className="text-gray-300 border-t border-white/10 align-top">
        <td className="px-2 py-1 w-48">{row.inputDescription}</td>
        <td className="px-2 py-1">
          <RadioGroup
            className="space-y-1"
            value={typeof row.selected === 'number' ? String(row.selected) : 'manual'}
            onValueChange={val => handleSelect(index, val)}
          >
            {row.matches.map((m, i) => (
              <div key={i} className="flex items-center space-x-1">
                <RadioGroupItem value={String(i)} id={`sel-${index}-${i}`} />
                <label htmlFor={`sel-${index}-${i}`} className="text-xs">{m.description}</label>
              </div>
            ))}
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="manual" id={`sel-${index}-manual`} />
              <label htmlFor={`sel-${index}-manual`} className="text-xs">Manual search...</label>
            </div>
          </RadioGroup>
          {row.selected === 'manual' && (
            <div className="mt-1 relative">
              <SearchInput placeholder="Search prices" onChange={q => handleSearch(index, q)} />
              {row.searchResults.length > 0 && (
                <ul className="absolute z-10 bg-black border border-white/20 max-h-40 overflow-auto w-64">
                  {row.searchResults.map(item => (
                    <li
                      key={item._id || item.code}
                      className="px-2 py-1 hover:bg-white/10 cursor-pointer"
                      onClick={e => {
                        e.preventDefault()
                        chooseManual(index, item)
                      }}
                    >
                      {item.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </td>
        <td className="px-2 py-1">
          <Input
            type="number"
            value={row.quantity}
            onChange={e => updateRow(index, r => ({ ...r, quantity: Number(e.target.value) }))}
            className="bg-white/5 border-white/10 w-20"
          />
        </td>
        <td className="px-2 py-1">{sel?.unit || ''}</td>
        <td className="px-2 py-1">
          <Input
            type="number"
            value={rate}
            onChange={e => updateRow(index, r => ({ ...r, rateOverride: Number(e.target.value) }))}
            className="bg-white/5 border-white/10 w-24"
          />
        </td>
        <td className="px-2 py-1">{sel?.confidence ?? ''}</td>
        <td className="px-2 py-1">{rate ? total.toLocaleString() : ''}</td>
        <td className="px-2 py-1">
          <Button type="button" size="icon" onClick={() => handleDeleteRow(index)} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30 ripple">
            <Trash className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    )
  })

  const [autoQuoteId, setAutoQuoteId] = useState<string | null>(null)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!autoQuoteId || !results) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveQuotationData(results, autoQuoteId)
    }, 1000)
  }, [results, discount, autoQuoteId])

  const saveQuotationData = async (rows: Row[], id?: string) => {
    const items = rows.map((r, idx) => {
      const sel = typeof r.selected === 'number' ? r.matches[r.selected] : null
      const rate = r.rateOverride ?? sel?.unitRate ?? 0
      return {
        id: idx + 1,
        description: r.inputDescription,
        quantity: r.quantity,
        unit: sel?.unit || '',
        unitPrice: rate,
        total: rate * r.quantity * (1 - discount / 100)
      }
    })
    const value = items.reduce((s, i) => s + i.total, 0)
    const quotation = {
      id: id || `QT-${Date.now()}`,
      client: clientName,
      project: projectName,
      value,
      status: 'pending',
      date: new Date().toISOString(),
      items
    }
    await saveQuotation(quotation)
    return quotation.id
  }

  const handleDeleteRow = (index: number) => {
    if (!results) return
    setResults(results.filter((_, i) => i !== index))
  }

  const exportExcel = async () => {
    if (!results || !fileData || !colIdx) return
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(fileData)
    const ws = wb.worksheets[0]
    results.forEach((r, i) => {
      const rowNum = headerIndex + 2 + i
      const row = ws.getRow(rowNum)
      if (colIdx.desc >= 0) row.getCell(colIdx.desc + 1).value = r.inputDescription
      if (colIdx.qty >= 0) row.getCell(colIdx.qty + 1).value = r.quantity
      const sel = typeof r.selected === 'number' ? r.matches[r.selected] : null
      if (colIdx.unit >= 0) row.getCell(colIdx.unit + 1).value = sel?.unit || ''
      if (colIdx.rate >= 0) row.getCell(colIdx.rate + 1).value = r.rateOverride ?? sel?.unitRate ?? ''
      row.commit()
    })
    const buf = await wb.xlsx.writeBuffer()
    const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'price_match_output.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!results) return
    if (!projectName.trim() || !clientName.trim()) {
      alert('Project and client name are required')
      return
    }
    const id = await saveQuotationData(results, autoQuoteId || undefined)
    setAutoQuoteId(id)
    const items = results.map((r, idx) => {
      const sel = typeof r.selected === 'number' ? r.matches[r.selected] : null
      const rate = r.rateOverride ?? sel?.unitRate ?? 0
      return {
        id: idx + 1,
        description: r.inputDescription,
        quantity: r.quantity,
        unit: sel?.unit || '',
        unitPrice: rate,
        total: rate * r.quantity * (1 - discount / 100)
      }
    })
    const value = items.reduce((s, i) => s + i.total, 0)
    alert(`Quotation saved. Total: ${formatCurrency(value)}`)
    router.push(`/quotations/${id}`)
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Price Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => setInputsCollapsed(!inputsCollapsed)}
            className="bg-white/5 border-white/20"
          >
            {inputsCollapsed ? 'Show Inputs' : 'Hide Inputs'}
          </Button>
        </div>
        {!inputsCollapsed && (
          <>
            <Input
              placeholder="Project Name"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="bg-gray-800/20 border-white/10"
            />
            <Input
              placeholder="Client Name"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="bg-gray-800/20 border-white/10"
            />
            <Select value={version} onValueChange={val => setVersion(val as 'v0' | 'v1' | 'v2')}>
              <SelectTrigger className="w-24 bg-gray-800/20 border-white/10">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v0">v0</SelectItem>
                <SelectItem value="v1">v1</SelectItem>
                <SelectItem value="v2">v2</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              ref={fileInputRef}
              className="bg-gray-800/20 border-white/10 file:bg-gray-700 file:text-white"
            />
          </>
        )}
        <Button type="button" onClick={runMatch} disabled={!file || loading} className="bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-black font-semibold">
          {loading ? "Matching..." : "Start Matching"}
        </Button>
        {loading && (
          <div className="space-y-2 w-full">
            <Progress value={progress} />
            <p className="text-xs text-gray-300">{texts[textIndex]}</p>
          </div>
        )}
        {logs.length > 0 && (
          <pre
            ref={logRef}
            className="bg-black/30 text-green-400 p-2 rounded max-h-40 overflow-auto text-xs whitespace-pre-wrap"
          >
            {logs.join("\n")}
          </pre>
        )}
        {error && (
          <p className="text-red-400 whitespace-pre-wrap">{error}</p>
        )}
        {results && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white">Discount %</span>
              <Input
                type="number"
                value={discountInput}
                onChange={e => setDiscountInput(Number(e.target.value))}
                className="w-20 bg-white/5 border-white/20"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => setDiscount(discountInput)}
                className="bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple"
              >
                Apply Discount
              </Button>
            </div>
            <Button type="button" onClick={handleSave} size="sm" className="bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/30 ripple">
              Save Quote
            </Button>
            <Button type="button" onClick={exportExcel} size="sm" className="bg-white/5 border-white/20 ml-2">
              Export Excel
            </Button>
          </div>
        )}
        {results && (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm text-left mt-4">
              <thead>
                <tr className="text-white">
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1">Match</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Unit</th>
                  <th className="px-2 py-1">Rate</th>
                  <th className="px-2 py-1">Conf.</th>
                  <th className="px-2 py-1">Total</th>
                  <th className="px-2 py-1">Delete</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(startIndex, endIndex).map((r, idx) => (
                  <PriceMatchRow key={startIndex + idx} row={r} index={startIndex + idx} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 text-white">
                  <td colSpan={7} className="text-right px-2 py-1 font-semibold">Total</td>
                  <td className="px-2 py-1 font-semibold">
                    {results.reduce((sum, r) => {
                      const sel = typeof r.selected === 'number' ? r.matches[r.selected] : null
                      const rate = r.rateOverride ?? sel?.unitRate ?? 0
                      return sum + rate * r.quantity * (1 - discount / 100)
                    }, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-between items-center mt-2">
              <Button type="button" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="bg-white/5 border-white/20">Prev</Button>
              <span className="text-white text-sm">
                Page {page + 1} of {pageCount || 1}
              </span>
              <Button type="button" size="sm" onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page + 1 >= pageCount} className="bg-white/5 border-white/20">Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
