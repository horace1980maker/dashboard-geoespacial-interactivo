from pathlib import Path

# Base directories
GLOBAL_KB_DIR = Path("documents/general")
ORG_KB_BASE_DIR = Path("documents")

# Chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100

# Embedding model (using free local model)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Vector store settings
VECTOR_STORE_DIR = Path("vector_store")
VECTOR_STORE_DIR.mkdir(exist_ok=True)
