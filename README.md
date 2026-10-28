# AI Study Helper

A local AI study tutor with a React frontend, a FastAPI backend, and Ollama.
You can ask questions or upload text-based PDF notes for explanations.

## Requirements

- Python 3.10 or later
- Node.js and npm
- [Ollama](https://ollama.com/) with the `qwen2.5:3b` model

## Run locally

In PowerShell, start Ollama and make sure the model is available:

```powershell
ollama pull qwen2.5:3b
```

In one terminal, start the backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

In another terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite (usually `http://localhost:5173`).
