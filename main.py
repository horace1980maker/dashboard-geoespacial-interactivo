import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from embedding_store import get_vectorstore
from openai import OpenAI

load_dotenv()
load_dotenv('.env.local')

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# Load vectorstore
try:
    vectorstore = get_vectorstore()
    print(f"✅ Vector store loaded successfully.")
except Exception as e:
    print(f"⚠️ Error loading vector store: {e}")
    vectorstore = None

class ChatRequest(BaseModel):
    query: str
    org_id: str
    language: str = "es"

class SummaryRequest(BaseModel):
    org_id: str
    country_name: str
    language: str = "es"

def retrieve_context(query: str, org_id: str, top_k: int = 5) -> list[str]:
    """Retrieve relevant chunks for the query and org_id."""
    if not vectorstore:
        return []
    
    try:
        # Search with metadata filter for org_id
        filter_dict = {"org_id": org_id.upper()}
        results = vectorstore.similarity_search(
            query,
            k=top_k,
            filter=filter_dict
        )
        return [doc.page_content for doc in results]
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return []

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    context_chunks = retrieve_context(request.query, request.org_id)
    
    if not context_chunks:
        msg = "No information found for this organization." if request.language == 'en' else "No se encontró información para esta organización en los documentos cargados."
        return {"response": msg}
    
    context_text = "\n\n".join(context_chunks)
    
    # Generate response using OpenAI
    system_prompt = "Eres un asistente experto en conservación ambiental y desarrollo sostenible en América Latina. Responde de manera precisa y concisa basándote ÚNICAMENTE en el contexto proporcionado. Si la información no está en el contexto, indícalo claramente."
    
    user_message = f"""Contexto de los documentos de la organización:
{context_text}

Pregunta del usuario: {request.query}

Por favor, responde la pregunta basándote únicamente en el contexto proporcionado."""
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=800
        )
        response_text = completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        response_text = f"Error generating response: {str(e)}"
    
    return {"response": response_text}

@app.post("/api/summary")
async def summary_endpoint(request: SummaryRequest):
    # Retrieve context relevant to the topics
    topics = [
        "amenazas principales threats",
        "servicios ecosistémicos ecosystem services",
        "medios de vida livelihoods",
        "conflictos conflicts",
        "soluciones basadas en naturaleza NbS",
        "importancia estratégica strategic importance"
    ]
    
    all_chunks = []
    for topic in topics:
        chunks = retrieve_context(topic, request.org_id, top_k=2)
        all_chunks.extend(chunks)
            
    context_text = "\n\n".join(all_chunks[:5])  # Limit to first 5 chunks
    
    if not context_text:
        return {"response": "<p>No hay información disponible en los documentos cargados para generar la tarjeta de conocimiento de esta organización.</p>"}

    # Generate summary using OpenAI
    system_prompt = "Eres un experto en análisis de información sobre conservación y desarrollo sostenible. Genera un resumen estructurado en HTML basándote únicamente en el contexto proporcionado."
    
    user_message = f"""Contexto de los documentos:
{context_text}

Genera un resumen estructurado en HTML que incluya:
- Amenazas principales
- Servicios ecosistémicos
- Medios de vida afectados
- Conflictos presentes
- Soluciones basadas en naturaleza (NbS) sugeridas
- Importancia estratégica del área

Usa el siguiente formato HTML:
<div class="insight-card space-y-4">
  <div class="section">
    <h4 class="font-bold text-brand-accent text-sm uppercase mb-1">Título de la sección</h4>
    <p class="text-slate-700 text-sm">Contenido...</p>
  </div>
</div>

Si no hay información para alguna sección, omítela."""
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.4,
            max_tokens=1000
        )
        html_response = completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        html_response = f"<p>Error generando resumen: {str(e)}</p>"
    
    return {"response": html_response}

# Mount static files
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    file_path = f"dist/{full_path}"
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))