from embedding_store import get_vectorstore

vectorstore = get_vectorstore()
collection = vectorstore._collection

# Get total count
total_count = collection.count()
print(f"Total documents in vectorstore: {total_count}")

# Try to query for EC-ORG-1
try:
    results = vectorstore.similarity_search(
        "educación ambiental",
        k=3,
        filter={"org_id": "EC-ORG-1"}
    )
    print(f"\nFound {len(results)} results for EC-ORG-1:")
    for i, doc in enumerate(results, 1):
        print(f"\n{i}. Source: {doc.metadata.get('source')}")
        print(f"   Org ID: {doc.metadata.get('org_id')}")
        print(f"   Preview: {doc.page_content[:100]}...")
except Exception as e:
    print(f"Error querying: {e}")
