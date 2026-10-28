
import { useState } from "react";
import "./App.css";

function App() {
  const [subject, setSubject] = useState("General");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);

  async function askAI() {
    if (!question.trim()) {
      alert("Please enter a question first.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, subject }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The AI request failed.");
      }

      setAnswer(data.answer || data.error || "No answer was returned.");
    } catch (error) {
      setAnswer("Could not connect to the AI. Check that the backend and Ollama are running.");
    } finally {
      setLoading(false);
    }
  }

  async function explainPDF() {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "question",
        question.trim() || "Summarize and explain these notes in simple English with examples."
      );

      const response = await fetch("http://127.0.0.1:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The PDF request failed.");
      }

      setAnswer(data.answer || data.error || "No explanation was returned.");
    } catch (error) {
      setAnswer("Could not process the PDF. Check that the backend and Ollama are running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <span>StudyMate AI</span>
        </div>
        <span className="local-label">● Local AI · Private learning</span>
      </header>

      <main className="main">
        <div className="hero">
          <span className="eyebrow">YOUR PERSONAL AI TUTOR</span>
          <h1>
            Learn anything.
            <br />
            <span>Understand everything.</span>
          </h1>
          <p>Ask questions or upload your notes to learn at your own pace.</p>
        </div>

        <section className="question-card">
          <div className="mode-buttons">
            <button
              className={!uploadMode ? "mode active" : "mode"}
              onClick={() => setUploadMode(false)}
              type="button"
            >
              Ask a question
            </button>
            <button
              className={uploadMode ? "mode active" : "mode"}
              onClick={() => setUploadMode(true)}
              type="button"
            >
              Upload PDF
            </button>
          </div>

          {uploadMode && (
            <div className="upload-box">
              <label htmlFor="pdf-file">Choose your study material</label>
              <input
                id="pdf-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
              />
              <p className="hint">
                PDF files only · Maximum size 10 MB
              </p>
              {file && <p className="selected-file">📄 {file.name}</p>}
            </div>
          )}

          {!uploadMode && (
            <>
              <label htmlFor="subject">What are you studying?</label>
              <select
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option>General</option>
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>Computer Science</option>
                <option>History</option>
              </select>
            </>
          )}

          <label htmlFor="question">
            {uploadMode
              ? "What should I explain from your PDF? (optional)"
              : "What would you like to understand?"}
          </label>

          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={
              uploadMode
                ? "For example: Explain chapter 2 with examples..."
                : "For example: Explain photosynthesis step by step..."
            }
            rows="5"
          />

          <button
            className="primary-button"
            onClick={uploadMode ? explainPDF : askAI}
            disabled={loading}
            type="button"
          >
            {loading
              ? "Reading and explaining..."
              : uploadMode
                ? "✦ Explain my PDF"
                : "✦ Explain this to me"}
          </button>

          <p className="hint">
            Simple explanations · Step-by-step learning
          </p>
        </section>

        {(loading || answer) && (
          <section className="answer-card">
            <h2>✦ Your learning answer</h2>
            {loading ? (
              <p className="loading-text">
                Your AI tutor is working. Larger documents may take longer...
              </p>
            ) : (
              <p className="answer-text">{answer}</p>
            )}
          </section>
        )}

        <footer>Made for curious minds. Powered by your local AI.</footer>
      </main>
    </div>
  );
}

export default App;
