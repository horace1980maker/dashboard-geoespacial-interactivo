# incremental_ingest.py
import json
import hashlib
import time
from pathlib import Path
from typing import Dict, Tuple, List

from tqdm import tqdm

# Use PyMuPDFLoader as specified
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag_config import (
    GLOBAL_KB_DIR,
    ORG_KB_BASE_DIR,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from embedding_store import get_vectorstore


MANIFEST_PATH = Path("processed_files.json")


def compute_file_hash(path: Path) -> str:
    """Return an MD5 hash of the file contents to detect changes."""
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> Dict[str, str]:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            print("⚠️ Could not read existing manifest, starting fresh.")
            return {}
    return {}


def save_manifest(manifest: Dict[str, str]) -> None:
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def collect_pdfs() -> List[Tuple[Path, str, str]]:
    """
    Returns a list of tuples (pdf_path, scope, org_id).

    - Global docs: scope='global', org_id='GLOBAL'
    - Org docs:    scope='org',   org_id='<ORGNAME IN UPPERCASE>'
    """
    pdfs = []

    # Global KB
    if GLOBAL_KB_DIR.exists():
        for path in GLOBAL_KB_DIR.rglob("*.pdf"):
            pdfs.append((path, "global", "GLOBAL"))

    # Org-specific KB
    if ORG_KB_BASE_DIR.exists():
        for org_dir in ORG_KB_BASE_DIR.iterdir():
            if org_dir.is_dir() and org_dir.name != "general":
                org_id = org_dir.name.upper()
                for path in org_dir.rglob("*.pdf"):
                    pdfs.append((path, "org", org_id))

    return pdfs


def main():
    print("📚 Incremental ingestion started...")
    overall_start = time.perf_counter()

    manifest = load_manifest()
    vectorstore = get_vectorstore()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    pdfs = collect_pdfs()
    if not pdfs:
        print("⚠️ No PDFs found in KB folders.")
        return

    print(f"🔎 Found {len(pdfs)} PDF(s) in KB folders.")

    new_or_changed_files = []
    for pdf_path, scope, org_id in pdfs:
        file_hash = compute_file_hash(pdf_path)
        key = str(pdf_path.resolve())
        old_hash = manifest.get(key)

        if old_hash != file_hash:
            new_or_changed_files.append((pdf_path, scope, org_id, file_hash))

    if not new_or_changed_files:
        print("✅ No new or modified PDFs detected. Nothing to ingest.")
        return

    print(f"🆕 PDFs to ingest/update: {len(new_or_changed_files)}")

    total_chunks_added = 0
    total_tokens_est = 0
    total_duplicates_skipped = 0

    # Dedup set for this run (hash of chunk text)
    seen_chunk_hashes: set[str] = set()

    # Progress bar over PDFs
    for pdf_path, scope, org_id, file_hash in tqdm(
        new_or_changed_files,
        desc="Ingesting PDFs",
        unit="pdf",
    ):
        pdf_start = time.perf_counter()

        # Delete old chunks for this file so we don't have duplicates
        try:
            vectorstore._collection.delete(where={"source": pdf_path.name})
        except Exception:
            pass  # It's a new file, nothing to delete

        print(f"\n  📄 Processing: {pdf_path}  [scope={scope}, org_id={org_id}]")
        print(f"  📄 Reading {pdf_path.name} ...")
        print(f"     📏 Using CHUNK_SIZE={CHUNK_SIZE}, CHUNK_OVERLAP={CHUNK_OVERLAP}")

        loader = PyMuPDFLoader(str(pdf_path))
        docs = loader.load()

        # Enrich metadata on raw docs
        for d in docs:
            d.metadata["source"] = pdf_path.name
            d.metadata["file_path"] = str(pdf_path)
            d.metadata["scope"] = scope
            d.metadata["org_id"] = org_id

        # Split into chunks
        chunks = text_splitter.split_documents(docs)

        # Duplicate-chunk prevention + token estimate
        unique_chunks = []
        pdf_tokens_est = 0
        pdf_duplicates = 0

        for ch in chunks:
            # Normalize text for hashing
            text = ch.page_content.strip()
            if not text:
                continue

            chash = hashlib.md5(text.encode("utf-8")).hexdigest()
            if chash in seen_chunk_hashes:
                pdf_duplicates += 1
                total_duplicates_skipped += 1
                continue

            seen_chunk_hashes.add(chash)
            unique_chunks.append(ch)

            # Approx tokens: words * ~1.3
            pdf_tokens_est += int(len(text.split()) * 1.3)

        print(
            f"    ➜ Created {len(chunks)} chunks "
            f"({len(unique_chunks)} unique, {pdf_duplicates} duplicates skipped)"
        )

        if unique_chunks:
            vectorstore.add_documents(unique_chunks)
            total_chunks_added += len(unique_chunks)
            total_tokens_est += pdf_tokens_est
            # Update manifest only after successful add
            manifest[str(pdf_path.resolve())] = file_hash

        pdf_elapsed = time.perf_counter() - pdf_start
        print(
            f"    ⏱️ Time: {pdf_elapsed:.1f}s  · "
            f"Approx tokens: {pdf_tokens_est:,}"
        )

    save_manifest(manifest)

    overall_elapsed = time.perf_counter() - overall_start

    print("\n✅ Incremental ingestion finished.")
    print(f"   Total new/updated PDFs: {len(new_or_changed_files)}")
    print(f"   Total chunks stored:    {total_chunks_added}")
    print(f"   Duplicate chunks skip:  {total_duplicates_skipped}")
    print(f"   Approx total tokens:    {total_tokens_est:,}")
    print(f"   Total time:             {overall_elapsed:.1f}s")


if __name__ == "__main__":
    main()
