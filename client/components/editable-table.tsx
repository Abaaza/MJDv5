"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Save, X, Plus } from "lucide-react"

interface EditableTableProps {
  isEditing: boolean
}

const mockItems = [
  { id: 1, description: "Structural Steel Framework", quantity: 150, unit: "tons", unitPrice: 2500, total: 375000 },
  { id: 2, description: "Concrete Foundation", quantity: 500, unit: "m³", unitPrice: 180, total: 90000 },
  { id: 3, description: "Electrical Installation", quantity: 1, unit: "lot", unitPrice: 125000, total: 125000 },
  { id: 4, description: "HVAC System", quantity: 15, unit: "units", unitPrice: 8500, total: 127500 },
  { id: 5, description: "Interior Finishing", quantity: 2500, unit: "m²", unitPrice: 150, total: 375000 },
]

export function EditableTable({ isEditing }: EditableTableProps) {
  const [items, setItems] = useState(mockItems)
  const [editingRow, setEditingRow] = useState<number | null>(null)

  const handleEdit = (id: number) => {
    setEditingRow(id)
  }

  const handleSave = (id: number) => {
    setEditingRow(null)
    // Save logic here
  }

  const handleCancel = () => {
    setEditingRow(null)
    // Reset changes logic here
  }

  const addNewRow = () => {
    const newItem = {
      id: items.length + 1,
      description: "New Item",
      quantity: 1,
      unit: "unit",
      unitPrice: 0,
      total: 0,
    }
    setItems([...items, newItem])
    setEditingRow(newItem.id)
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Items & Pricing</CardTitle>
        {isEditing && (
          <Button
            onClick={addNewRow}
            size="sm"
            className="bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/30 ripple"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Description</TableHead>
                <TableHead className="text-gray-400">Qty</TableHead>
                <TableHead className="text-gray-400">Unit</TableHead>
                <TableHead className="text-gray-400">Unit Price</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                {isEditing && <TableHead className="text-gray-400">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    {editingRow === item.id ? (
                      <Input defaultValue={item.description} className="bg-white/5 border-white/10" />
                    ) : (
                      <span className="text-white">{item.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === item.id ? (
                      <Input type="number" defaultValue={item.quantity} className="bg-white/5 border-white/10 w-20" />
                    ) : (
                      <span className="text-white">{item.quantity}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === item.id ? (
                      <Input defaultValue={item.unit} className="bg-white/5 border-white/10 w-20" />
                    ) : (
                      <span className="text-white">{item.unit}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === item.id ? (
                      <Input type="number" defaultValue={item.unitPrice} className="bg-white/5 border-white/10 w-24" />
                    ) : (
                      <span className="text-white">${item.unitPrice.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold neon-blue">${item.total.toLocaleString()}</span>
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {editingRow === item.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(item.id)}
                              className="bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/30 ripple"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="border-white/20 hover:bg-white/10 ripple"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item.id)}
                            className="border-white/20 hover:bg-white/10 ripple"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
