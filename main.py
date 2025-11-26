import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI()

# 1. API Proxy (Hides your Key from the browser)
@app.post("/api/analyze")
async def analyze_data(request: Request):
    # Your Gemini Logic goes here later.
    # This way, the API Key stays ON THE SERVER, safe from users.
    api_key = os.environ.get("GEMINI_API_KEY")
    return {"message": "Analysis from secure backend"}

# 2. Serve React App (The "dist" folder)
# Mount the 'dist' folder as a static directory
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# Catch-all route to serve index.html for any other path (React Router support)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))