"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileCheck, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { generateProof } from "@/lib/api"

export default function ProofGenerator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [documentId, setDocumentId] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<string>("1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proofData, setProofData] = useState<any>(null)

  useEffect(() => {
    const docId = searchParams?.get("docId")
    if (docId) {
      setDocumentId(docId)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentId.trim()) {
      setError("Document ID is required")
      return
    }

    const page = Number.parseInt(pageNumber)
    if (isNaN(page) || page < 1) {
      setError("Page number must be a positive integer")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const proof = await generateProof(documentId, page)
      setProofData(proof)
      setProofGenerated(true)
    } catch (err: any) {
      setError(err.message || "Failed to generate proof")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!proofData) return

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proof-${documentId}-page-${pageNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleVerify = () => {
    router.push("/verify")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="documentId">Document ID</Label>
          <Input
            id="documentId"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="Enter document ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pageNumber">Page Number</Label>
          <Input
            id="pageNumber"
            type="number"
            min="1"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="Enter page number"
            required
          />
        </div>

        {error && (
          <div className="flex items-center rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <FileCheck className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Generate Proof
            </>
          )}
        </Button>
      </form>

      {proofGenerated && (
        <Card className="p-4">
          <div className="mb-3 flex items-center text-emerald-600">
            <FileCheck className="mr-2 h-5 w-5" />
            <h3 className="font-medium">Proof Generated Successfully</h3>
          </div>

          <div className="max-h-60 overflow-auto rounded bg-gray-50 p-3">
            <pre className="text-xs text-gray-700">{JSON.stringify(proofData, null, 2)}</pre>
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Download className="mr-2 h-4 w-4" />
              Download Proof
            </Button>

            <Button onClick={handleVerify} variant="outline" className="flex-1">
              Verify Proof
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
