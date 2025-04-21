import type { Metadata } from "next"
import VerifyForm from "@/components/verify-form"
import Navigation from "@/components/navigation"

export const metadata: Metadata = {
  title: "Verify Proof | Document Authentication System",
  description: "Verify document proofs",
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Verify Proof</h1>
            <p className="mt-4 text-lg text-gray-600">
              Verify the authenticity of a document page using its merkle proof
            </p>
          </div>

          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Proof Verification</h2>
            <VerifyForm />
          </div>
        </div>
      </main>
    </div>
  )
}
