"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileType, Check, AlertCircle, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { uploadDocument } from "@/lib/api"

export default function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setUploadResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a PDF file")
      return
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocument(file)
      setUploadResult(result)
    } catch (err: any) {
      setError(err.message || "Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateProof = () => {
    if (uploadResult?.documentId) {
      router.push(`/generate-proof?docId=${uploadResult.documentId}`)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FileType className="h-6 w-6" />
          </div>

          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-gray-900">{file ? file.name : "Drag and drop your PDF file here"}</p>
            <p className="text-xs text-gray-500">PDF files only, max 10MB</p>
          </div>

          <label className="cursor-pointer">
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100">
              Select file
            </span>
            <input type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
          </label>
        </div>

        {error && (
          <div className="flex items-center rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!file || isUploading}>
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </form>

      {uploadResult && (
        <Card className="p-4">
          <div className="mb-3 flex items-center text-emerald-600">
            <Check className="mr-2 h-5 w-5" />
            <h3 className="font-medium">Document Uploaded Successfully</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-500">Document ID:</span>
              <span className="col-span-2 font-mono">{uploadResult.documentId}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-500">Root Hash:</span>
              <span className="col-span-2 break-all font-mono text-xs">{uploadResult.rootHash}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-500">Pages:</span>
              <span className="col-span-2">{uploadResult.pageCount}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-500">Timestamp:</span>
              <span className="col-span-2">{new Date(uploadResult.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <Button onClick={handleGenerateProof} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
            <FileCheck className="mr-2 h-4 w-4" />
            Generate Proof
          </Button>
        </Card>
      )}
    </div>
  )
}
