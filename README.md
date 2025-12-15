# 🤖 JOB_BOT-LLM-RAG  
### AI-Powered Smart Job Search Assistant (LLM + RAG + RapidAPI)

JOB_BOT-LLM-RAG is an **AI-driven job search chatbot** that understands natural language job queries, enriches them using **Retrieval-Augmented Generation (RAG)**, and fetches **real-time job listings** using **RapidAPI (JSearch)**.  
The chatbot runs a **local LLM using Ollama (Mistral)** and provides an interactive **React-based floating chat UI** that can be embedded into any website.

---

## 🚀 Key Features

- 🧠 **Local LLM (Ollama – Mistral)** for query understanding  
- 🔎 **RAG pipeline** for context enrichment and accuracy  
- 🌐 **Real-time job data** via RapidAPI (JSearch API)  
- ⚡ **FastAPI backend** for scalable AI orchestration  
- 💬 **Draggable floating chatbot UI** built with React  
- 🧾 Resume upload support (future-ready)  
- ❌ Minimal hallucination (API-backed responses)  

---

##  Project Architecture

User (Website)
↓
React Floating Chat UI
↓
FastAPI Backend
↓
LLM (Ollama - Mistral)
↓
RAG Context Retrieval
↓
RapidAPI (JSearch)
↓
Formatted Job Results
↓
React UI Display

yaml
Copy code

---

##  Tech Stack

### Frontend
- React.js
- ReactMarkdown
- Lucide Icons
- Floating & Draggable UI

### Backend
- FastAPI
- Python
- Uvicorn
- CORS Middleware

### AI / ML
- Ollama (Local LLM)
- Mistral Base Model
- Retrieval-Augmented Generation (RAG)

### APIs
- RapidAPI – JSearch Job Search API

---

##  Folder Structure

JOB_BOT-LLM-RAG/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── routers/
│ │ │ ├── chat.py
│ │ │ └── jobs.py
│ │ └── services/
│ │ ├── rag.py
│ │ └── llm.py
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── Components/
│ │ │ └── Bot.js
│ │ └── App.js
│ └── package.json
│
└── README.md

yaml
Copy code

---

##  Prerequisites

- Python **3.9+**
- Node.js **18+**
- Git
- Ollama installed locally
- RapidAPI account

---

##  Install Ollama & LLM

### Install Ollama
https://ollama.com/download

### Pull Mistral Model

ollama pull mistral
Verify
bash
Copy code
ollama list

###  Environment Setup
Create a .env file inside backend/:
env

RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=jsearch.p.rapidapi.com

### Backend Installation

cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux / Mac

pip install -r requirements.txt

###  Run Backend Server

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Backend will run at:
http://127.0.0.1:8000

### 📦 Frontend Installation

cd frontend
npm install
Run Frontend
npm start

Frontend will run at:
http://localhost:3000

###  Example Queries
java developer jobs in Google
software jobs posted on 2025-09-02
remote python jobs with 2 years experience
full stack developer jobs in Texas


### How RAG Helps This Project

Adds missing job context (role, skills, domain)
Prevents empty API searches
Reduces hallucination
Improves relevance of job results
RAG does not fetch jobs — it enhances queries before API calls.

###  Challenges Faced
Handling incomplete user queries (date-only, skill-only)
Preventing LLM hallucination
Managing large files in Git
CORS and frontend-backend connectivity issues
Optimizing UI responsiveness for floating chat

### Future Enhancements
Resume → Job Matching Score
Personalized job recommendations
Multi-turn conversation memory
ATS integration
LinkedIn job scraping
HR contact intelligence

### Known Limitations
Requires local Ollama runtime
API rate limits apply
Not trained from scratch (uses base LLM)

### 📜 License
This project is for educational and demonstration purposes.



🔗 GitHub: https://github.com/Sadafshaik-786


⭐ If you like this project, don’t forget to star the repository!
