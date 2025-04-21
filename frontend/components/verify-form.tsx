"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { verifyProof } from "@/lib/api"

export default function VerifyForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [proofDetails, setProofDetails] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setVerificationResult(null)
    setProofDetails(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a proof file")
      return
    }

    if (!file.name.endsWith(".json")) {
      setError("Only JSON files are supported")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Read the file content
      const fileContent = await file.text()
      let proofData

      try {
        proofData = JSON.parse(fileContent)
      } catch (err) {
        throw new Error("Invalid JSON file")
      }

      const result = await verifyProof(proofData)
      setVerificationResult(result.verified)
      setProofDetails(result.details)
    } catch (err: any) {
      setError(err.message || "Failed to verify proof")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Upload className="h-6 w-6" />
          </div>

          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-gray-900">
              {file ? file.name : "Drag and drop your proof file here"}
            </p>
            <p className="text-xs text-gray-500">JSON files only</p>
          </div>

          <label className="cursor-pointer">
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100">
              Select file
            </span>
            <input type="file" className="sr-only" accept=".json" onChange={handleFileChange} />
          </label>
        </div>

        {error && (
          <div className="flex items-center rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!file || isVerifying}>
          {isVerifying ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Verify Proof
            </>
          )}
        </Button>
      </form>

      {verificationResult !== null && (
        <Card className={`p-4 ${verificationResult ? "bg-green-50" : "bg-red-50"}`}>
          <div className={`mb-3 flex items-center ${verificationResult ? "text-green-600" : "text-red-600"}`}>
            {verificationResult ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Proof Verified Successfully</h3>
              </>
            ) : (
              <>
                <X className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Proof Verification Failed</h3>
              </>
            )}
          </div>

          {proofDetails && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-500">Document ID:</span>
                <span className="col-span-2 font-mono">{proofDetails.documentId}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-500">Page Number:</span>
                <span className="col-span-2">{proofDetails.pageNumber}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-500">Page Hash:</span>
                <span className="col-span-2 break-all font-mono text-xs">{proofDetails.pageHash}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-500">Root Hash:</span>
                <span className="col-span-2 break-all font-mono text-xs">{proofDetails.rootHash}</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
