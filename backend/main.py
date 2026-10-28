
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from io import BytesIO
import requests

app = FastAPI(title="AI Study Helper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:3b"


class StudyQuestion(BaseModel):
    question: str
    subject: str = "General"


def ask_ollama(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 500
            }
        },
        timeout=300,
    )
    response.raise_for_status()
    return response.json()["response"]


@app.get("/")
def home():
    return {"message": "AI Study Helper backend is running!"}


@app.post("/ask")
def ask_question(data: StudyQuestion):
    if not data.question or not data.question.strip():
        raise HTTPException(status_code=400, detail="Please enter a question.")

    prompt = f"""
You are a friendly AI tutor.
Subject: {data.subject}
Student question: {data.question}

Explain in simple English using clear steps and examples.
"""
    try:
        return {"answer": ask_ollama(prompt)}
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Ollama is not running or not reachable.") from exc


@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    question: str = Form("Explain these study notes in simple English."),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return {"error": "Please upload a PDF file."}

    pdf_bytes = await file.read()

    if len(pdf_bytes) > 10 * 1024 * 1024:
        return {"error": "Please upload a PDF smaller than 10 MB."}

    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        text = "\n".join(
            page.extract_text() or "" for page in reader.pages[:30]
        )
    except Exception:
        return {"error": "Could not read this PDF. Please try another file."}

    if not text.strip():
        return {
            "error": "No readable text found. This PDF may be scanned or image-based."
        }

    # Limit document context to avoid overwhelming your local model.
    text = text[:8000]

    prompt = f"""
You are a friendly AI study tutor.
Explain the uploaded study material in simple English.
Use headings, clear steps, and examples where helpful.
Base your explanation on the supplied document.
If something is not covered, say so honestly.

Student request: {question}

Document text:
{text}
"""

    try:
        answer = ask_ollama(prompt)
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Ollama is not running or not reachable.") from exc

    return {
        "filename": file.filename,
        "answer": answer,
    }
