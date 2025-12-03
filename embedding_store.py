from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from rag_config import EMBEDDING_MODEL, VECTOR_STORE_DIR

_vectorstore = None

def get_vectorstore():
    """Get or create the vectorstore singleton."""
    global _vectorstore
    if _vectorstore is None:
        embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        _vectorstore = Chroma(
            persist_directory=str(VECTOR_STORE_DIR),
            embedding_function=embeddings
        )
    return _vectorstore
