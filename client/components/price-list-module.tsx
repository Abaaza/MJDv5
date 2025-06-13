"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  getPriceItems,
  getCategories,
  updatePriceItem,
  createPriceItem,
  deletePriceItem,
  PriceItem,
} from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface PriceItemExt extends PriceItem {
  category?: string
  subCategory?: string
  keywords?: string[]
  phrases?: string[]
  ref?: string
}

export function PriceListModule() {
  const [items, setItems] = useState<PriceItemExt[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Record<string, Partial<PriceItemExt>>>({})
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [sort, setSort] = useState("description")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { token } = useAuth()

  const load = async () => {
    setLoading(true)
    try {
      if (!token) return
      const data = await getPriceItems(token, {
        page,
        limit,
        sort,
        q: search,
        categories: selectedCategories,
      })
      const normalized = data.items.map(it => ({
        ...it,
        _id: (it as any)._id ? (it as any)._id.toString() : undefined,
      }))
      setItems(normalized)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, token, page, limit, sort, selectedCategories])

  useEffect(() => {
    if (!token) return
    getCategories(token)
      .then(setCategories)
      .catch(err => console.error(err))
  }, [token])

  const handleChange = (id: string, field: keyof PriceItemExt, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const startEditing = (id: string) => {
    const item = items.find(it => it._id === id)
    if (!item) return
    setEditing(prev => ({
      ...prev,
      [id]: { ...item },
    }))
  }

  const handleSave = async (id: string) => {
    const upd = editing[id]
    if (!upd) return
    if (!token) return
    const updates: any = { ...upd }
    if (typeof updates.keywords === "string") {
      updates.keywords = updates.keywords
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    }
    if (typeof updates.phrases === "string") {
      updates.phrases = updates.phrases
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    }
    try {
      let result: PriceItemExt
      if (id.startsWith("new-")) {
        result = (await createPriceItem(updates, token)) as PriceItemExt
      } else {
        result = (await updatePriceItem(id, updates, token)) as PriceItemExt
      }
      setItems(itms =>
        itms.map(it => (it._id === id ? { ...result, _id: (result as any)._id.toString() } : it))
      )
      setEditing(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    } catch (err) {
      console.error(err)
    }
  }


  const handleAdd = () => {
    const id = `new-${Date.now()}`
    const newItem: PriceItemExt = { _id: id, description: "" }
    setItems(itms => [...itms, newItem])
    setEditing(prev => ({ ...prev, [id]: newItem }))
  }

  const handleDelete = async (id: string) => {
    const item = items.find(it => it._id === id)
    const desc = item?.description || "this item"
    const confirm = window.confirm(`Are you sure you want to delete \"${desc}\"?`)
    if (!confirm) return

    if (id.startsWith("new-")) {
      setItems(itms => itms.filter(it => it._id !== id))
      setEditing(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
      return
    }
    if (!token) return
    try {
      await deletePriceItem(id, token)
      setItems(itms => itms.filter(it => it._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Price List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm bg-white/5 border-white/10 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
          />
          <Select value={String(limit)} onValueChange={val => { setPage(1); setLimit(parseInt(val)) }}>
            <SelectTrigger className="w-20 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="300">300</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={val => { setPage(1); setSort(val) }}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="description">Description ⬆</SelectItem>
              <SelectItem value="-description">Description ⬇</SelectItem>
              <SelectItem value="rate">Rate ⬆</SelectItem>
              <SelectItem value="-rate">Rate ⬇</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <select
              multiple
              value={selectedCategories}
              onChange={e => {
                const opts = Array.from(e.target.selectedOptions).map(o => o.value)
                setSelectedCategories(opts)
                setPage(1)
              }}
              className="bg-white/5 border-white/10 text-white text-xs p-1 h-20"
            >
              {categories.map(c => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            className="bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/30 ripple"
          >
            Add Item
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="overflow-auto max-h-[70vh]">
            <Table className="min-w-full text-xs">
              <TableHeader>
                <TableRow className="text-white">
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sub Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Phrases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => {
                  const values = editing[item._id ?? ""] || {}
                  const isEditing = editing[item._id ?? ""] !== undefined
                  return (
                    <TableRow key={item._id} className="border-b border-white/10">
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.description ?? item.description}
                            onChange={e => handleChange(item._id!, "description", e.target.value)}
                          />
                        ) : (
                          <span>{item.description}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.category ?? item.category ?? ""}
                            onChange={e => handleChange(item._id!, "category", e.target.value)}
                          />
                        ) : (
                          <span>{item.category}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.subCategory ?? item.subCategory ?? ""}
                            onChange={e => handleChange(item._id!, "subCategory", e.target.value)}
                          />
                        ) : (
                          <span>{item.subCategory}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.unit ?? item.unit ?? ""}
                            onChange={e => handleChange(item._id!, "unit", e.target.value)}
                          />
                        ) : (
                          <span>{item.unit}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            className="bg-white/5 border-white/10"
                            value={values.rate ?? item.rate ?? ""}
                            onChange={e => handleChange(item._id!, "rate", parseFloat(e.target.value))}
                          />
                        ) : (
                          <span>{item.rate}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.keywords ?? (item.keywords || []).join(", ")}
                            onChange={e => handleChange(item._id!, "keywords", e.target.value)}
                          />
                        ) : (
                          <span>{(item.keywords || []).join(", ")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            className="bg-white/5 border-white/10"
                            value={values.phrases ?? (item.phrases || []).join(", ")}
                            onChange={e => handleChange(item._id!, "phrases", e.target.value)}
                          />
                        ) : (
                          <span>{(item.phrases || []).join(", ")}</span>
                        )}
                      </TableCell>
                        <TableCell className="space-x-1 flex items-center">
                          {isEditing ? (
                            <Button
                              size="sm"
                              onClick={() => handleSave(item._id!)}
                              className="bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple"
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => startEditing(item._id!)}
                              className="bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/30 ripple"
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleDelete(item._id!)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30 ripple"
                          >
                            Delete
                          </Button>
                        </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }} />
            </PaginationItem>
            <PaginationItem className="px-3 py-2 text-sm text-white">
              {page} / {Math.max(1, Math.ceil(total / limit))}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(Math.ceil(total / limit), p + 1)) }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  )
}
