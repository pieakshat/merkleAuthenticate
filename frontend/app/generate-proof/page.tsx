import type { Metadata } from "next"
import ProofGenerator from "@/components/proof-generator"
import Navigation from "@/components/navigation"

export const metadata: Metadata = {
  title: "Generate Proof | Document Authentication System",
  description: "Generate proof for document pages",
}

export default function GenerateProofPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Generate Proof</h1>
            <p className="mt-4 text-lg text-gray-600">Generate a merkle proof for a specific page of your document</p>
          </div>

          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Proof Generator</h2>
            <ProofGenerator />
          </div>
        </div>
      </main>
    </div>
  )
}
