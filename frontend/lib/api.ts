// API utility functions for interacting with the backend

/**
 * Upload a document to the server
 * @param file PDF file to upload
 * @returns Document data including ID and root hash
 */
export async function uploadDocument(file: File): Promise<any> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch("http://127.0.0.1:8080/documents", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${errorText || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Document upload error:", error)
    throw error
  }
}

/**
 * Generate a proof for a specific page of a document
 * @param documentId Document ID
 * @param pageNumber Page number to generate proof for
 * @returns Proof data
 */
export async function generateProof(documentId: string, pageNumber: number): Promise<any> {
  try {
    const response = await fetch(`http://127.0.0.1:8080/documents/${documentId}/proof/${pageNumber}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Proof generation failed: ${errorText || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Proof generation error:", error)
    throw error
  }
}

/**
 * Verify a proof
 * @param proofData Proof data to verify
 * @returns Verification result
 */
export async function verifyProof(proofData: any): Promise<any> {
  try {
    const response = await fetch("http://127.0.0.1:8080/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proofData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Verification failed: ${errorText || response.statusText}`)
    }

    const result = await response.json()

    // Assuming the API returns a boolean or an object with a verified property
    return {
      verified: typeof result === "boolean" ? result : result.verified,
      details: proofData,
    }
  } catch (error) {
    console.error("Proof verification error:", error)
    throw error
  }
}
