import type { Metadata } from "next"
import UploadForm from "@/components/upload-form"
import Navigation from "@/components/navigation"
import { Providers } from "@/hooks/Providers"

export const metadata: Metadata = {
  title: "Document Authentication System",
  description: "Authenticate documents using merkle trees",
}

export default function HomePage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Document Authentication</h1>
              <p className="mt-4 text-lg text-gray-600">Securely authenticate your documents using merkle trees</p>
            </div>

            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-semibold">Upload Document</h2>
              <UploadForm />
            </div>
          </div>
        </main>
      </div>
    </Providers>
  )
}
