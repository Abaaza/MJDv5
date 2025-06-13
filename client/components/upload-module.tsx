"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  id: string
  name: string
  size: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  items?: number
}

export function UploadModule() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (fileList: File[]) => {
    const excelFiles = fileList.filter((file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))

    if (excelFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload Excel files only (.xlsx or .xls)",
        variant: "destructive",
      })
      return
    }

    const newFiles: UploadedFile[] = excelFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload and processing
    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20

      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, progress: Math.min(progress, 100) } : file)),
      )

      if (progress >= 100) {
        clearInterval(interval)

        // Simulate processing
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? {
                    ...file,
                    status: "processing",
                    progress: 0,
                  }
                : file,
            ),
          )

          // Simulate completion
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((file) =>
                file.id === fileId
                  ? {
                      ...file,
                      status: "completed",
                      progress: 100,
                      items: Math.floor(Math.random() * 50) + 10,
                    }
                  : file,
              ),
            )

            toast({
              title: "File processed successfully",
              description: "Pricing logic has been applied to all items",
            })
          }, 2000)
        }, 1000)
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 neon-green" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <FileSpreadsheet className="h-4 w-4 neon-blue" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      uploading: "bg-blue-500/20 text-[#00D4FF] border-blue-500/30",
      processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-[#00FF88] border-green-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    return (
      <Badge className={`${statusClasses[status as keyof typeof statusClasses]} border rounded-full px-2 py-1 text-xs`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Document Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging ? "border-[#00D4FF] bg-[#00D4FF]/10 glow-blue" : "border-white/20 hover:border-white/40"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Drop Excel files here</h3>
          <p className="text-gray-400 mb-4">or click to browse your files</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-[#00D4FF] to-[#00FF88] hover:from-[#00D4FF]/80 hover:to-[#00FF88]/80 text-black font-semibold ripple cursor-pointer"
          >
            Browse Files
          </Button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Uploaded Files</h4>
            {files.map((file) => (
              <div key={file.id} className="glass-effect border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-xs text-gray-400">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(file.status)}
                    {file.status === "completed" && (
                      <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 ripple">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(file.id)}
                      className="border-white/20 hover:bg-white/10 ripple"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {(file.status === "uploading" || file.status === "processing") && (
                  <div className="space-y-2">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-gray-400">
                      {file.status === "uploading" ? "Uploading..." : "Processing pricing logic..."}
                    </p>
                  </div>
                )}

                {file.status === "completed" && file.items && (
                  <p className="text-sm text-[#00FF88] mt-2">✓ {file.items} items processed successfully</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
