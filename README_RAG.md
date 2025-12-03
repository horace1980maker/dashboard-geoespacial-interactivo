# CATIE Dashboard - Knowledge Base Setup

## Overview
This dashboard uses a RAG (Retrieval-Augmented Generation) system with **free local embeddings** to provide organization-specific information.

## Key Files

### Configuration
- **`rag_config.py`**: Configuration constants for chunk sizes, directories, and embedding model
- **`embedding_store.py`**: Vectorstore setup using free HuggingFace embeddings (no API key needed)
- **`ingest.py`**: Incremental document ingestion script

### Document Structure
```
documents/
├── general/           # Global knowledge base
├── mx-org-1/         # Cecropia (Mexico)
├── mx-org-2/         # Fondo de Conservación El Triunfo
├── gt-org-1/         # AsoVerde (Guatemala)
├── gt-org-2/         # Asociación ECO
├── gt-org-3/         # Defensores de la Naturaleza
├── hn-org-1/         # Honduras org 1
├── hn-org-2/         # Honduras org 2
├── hn-org-3/         # Honduras org 3
├── sv-org-1/         # El Salvador org 1
├── ec-org-1/         # Ecuador org 1
├── ec-org-2/         # Ecuador org 2
└── co-org-1/         # Colombia org 1
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Add Documents
Place PDF files in the appropriate organization folders under `documents/`

### 3. Run Ingestion
```bash
python ingest.py
```

The ingestion script will:
- ✅ Detect new or modified PDFs
- ✅ Extract text using PyMuPDF
- ✅ Split into chunks with overlap
- ✅ Generate embeddings using local model (no API key needed!)
- ✅ Store in ChromaDB vector database
- ✅ Track processed files to avoid re-processing

### 4. Start Backend
```bash
python main.py
```

### 5. Build Frontend
```bash
npm run build
```

## Features

### Free Local Embeddings
- Uses `sentence-transformers/all-MiniLM-L6-v2`
- No API key required
- Runs entirely on your machine
- Fast and efficient

### Incremental Processing
- Only processes new or modified files
- Maintains a manifest (`processed_files.json`)
- Deletes old chunks when files are updated

### Organization-Scoped RAG
- Each query is filtered by organization ID
- Ensures responses only use relevant documents
- Supports both global and org-specific knowledge

## Console Output Example
```
📚 Incremental ingestion started...
🔎 Found 5 PDF(s) in KB folders.
🆕 Documents to ingest/update: 2

  📄 Processing: documents/mx-org-1/report.pdf  [scope=org, org_id=MX-ORG-1]
  📄 Reading report.pdf ...
     📏 Using CHUNK_SIZE=1000, CHUNK_OVERLAP=100
    ➜ Created 25 chunks (25 unique, 0 duplicates skipped)
    ⏱️ Time: 2.9s  · Approx tokens: 4,513

✅ Incremental ingestion finished.
   Total new/updated Docs: 2
   Total chunks stored:    45
   Approx total tokens:    8,926
   Total time:             5.8s
```

## API Endpoints

### POST /api/chat
Ask questions about an organization's documents.

**Request:**
```json
{
  "query": "¿Qué hace esta organización?",
  "org_id": "mx-org-1",
  "language": "es"
}
```

### POST /api/summary
Generate a territorial insight card for an organization.

**Request:**
```json
{
  "org_id": "mx-org-1", 
  "country_name": "México",
  "language": "es"
}
```

## Dependencies
- **LangChain**: Document processing and vectorstore
- **PyMuPDF**: PDF text extraction
- **HuggingFace**: Free local embeddings
- **ChromaDB**: Vector database
- **FastAPI**: Backend server
- **React + Vite**: Frontend

## Notes
- The system works completely offline after initial model download
- No API keys or external services required for embeddings
- First run will download the embedding model (~80MB)
- Subsequent runs use cached model
