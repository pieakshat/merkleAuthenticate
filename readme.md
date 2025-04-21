# 📄 MerkleDoc: Verifiable Document Proof System

MerkleDoc is a full-stack Rust + Next.js application that enables users to **prove the authenticity of any page in a document** using Merkle trees.

When a user uploads a PDF, the backend extracts text from each page, hashes every page individually, and constructs a Merkle tree from those hashes. The **Merkle root** and all **page hashes** are stored in MongoDB.

Anyone can then generate a cryptographic proof for a specific page and verify that it was part of the original document—without needing access to the entire file.

---

## 🌳 Why Merkle Trees?

Merkle trees allow you to **prove the inclusion of a data element (like a page)** in a larger dataset (the entire document) without revealing the full dataset.

### ✨ Real-world Use Cases

- Verifying individual **clauses in legal contracts**
- Ensuring **page integrity** in digital publications
- Authenticating **partial excerpts** from academic papers
- Proof of inclusion for **off-chain document storage systems**

---

### 🧠 How It Works

1. 📝 You upload a PDF.
2. 📄 Each page is hashed using SHA-256.
3. 🌲 A Merkle tree is built using these page hashes.
4. 💾 The Merkle root and page hashes are saved in MongoDB.
5. 📜 You can now:
   - Generate a **Merkle proof** for any page.
   - Verify the page's authenticity using the proof and the Merkle root.

---

## 🛠 How to Run the Project

This project is divided into:

- `backend/` — Rust Actix Web server + MongoDB
- `frontend/` — Next.js UI to interact with the backend

---

## 📦 1. Backend Setup (Rust)

### 🔧 Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [MongoDB](https://www.mongodb.com/try/download/community)
- `cargo` (comes with Rust)

### 📁 Navigate into the backend directory

```bash
cd backend
touch .env
```

Paste this content inside .env:

```bash
MONGODB_URI=
MONGODB_NAME=merkle_docs
HOST=127.0.0.1
PORT=8080
```
run
```bash
cargo run
```


## Frontend Setup (next.js)

on another terminal
```bash
cd frontend 
npm install -g pnpm
pnpm install
npm run dev
```



## 📡 API Routes Overview

## POST /documents
Accepts a PDF file (multipart form)

Extracts page text and hashes each page using SHA-256

Builds a Merkle tree and stores:

Root hash in the documents collection

All individual page hashes in the pages collection

returns 
```json
{
  "document_id": "uuid",
  "root_hash": "abc123...",
  "n_pages": 5
}
```


## GET /documents/:id/proof/:page
Generates a Merkle proof for a specific page

Uses page hashes from MongoDB to rebuild the tree

Returns the Merkle proof path

```json
{
  "page_index": 2,
  "page_hash": "hash-of-page-2",
  "root_hash": "root-hash-of-document",
  "proof": [["sibling-hash-1", "L"], ["sibling-hash-2", "R"], ...]
}
```

## POST /verify
Accepts:
    page_hash
    root_hash
    proof (from /proof route)

Verifies the page hash leads to the root using the given proof

```json
{
  "valid": true
}
```