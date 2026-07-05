# NextGen ATS: AI-Powered Resume Screening & Applicant Tracking System

NextGen ATS is an enterprise-grade Applicant Tracking System (ATS) and resume screening platform designed for modern HR and recruitment departments. It automates candidate workflows, parses profiles using natural language processing (NLP), scores them using L2 normalized Sentence Transformer vector embeddings, and tracks all mutations via a security-hardened database audit log.

---

## ⚡ Key Features

### 1. **Core ATS Workflows**
- **Job Creation & CRUD:** Recruiters can publish, edit, archive, and duplicate postings.
- **Stage Progression:** Visual applicant flow tracking through standard stages: `Applied` &rarr; `Screening` &rarr; `Interview` &rarr; `Offered` &rarr; `Rejected`.
- **Interview Scheduling:** Integrated scheduler module creating Interview records and notifying candidates.

### 2. **Artificial Intelligence & NLP Core**
- **NLP Profile Parser:** Extracts candidate names, emails, phone numbers, external portfolio links, and technology skills using custom spaCy and regex engines.
- **L2 Normalized Semantic Matching:** Converts resume text and job description documents into vector embeddings using `Sentence Transformers` (`all-MiniLM-L6-v2`), performing L2 normalization before computing cosine similarity. This yields robust, length-invariant scoring.
- **AI Cover Letter Generator:** Drafts formal, customized letters matching resume skills directly with target job responsibilities.
- **AI Interview Prep:** Compiles specific technical and situational preparation questions targeting missing or overlapping skills.
- **ATS suggestions:** Highlights missing keywords and lists actionable improvements to increase applicant match rates.

### 3. **Enterprise SaaS Architecture & Security**
- **Role-Based Access Control (RBAC):** Three primary tiers (`Admin`, `Recruiter`, `Candidate`) protected via route-level guards on the frontend and OAuth2 JWT scopes on the backend.
- **Audit Logs:** Full system transparency with database audit tables capturing all mutations (e.g. login, resume upload, matching execution, and status modifications) alongside IP addresses and metadata.
- **Real-Time Communications:** Connected via WebSocket sockets to notify candidates and recruiters of parsing states, scores, and stage progressions instantly.
- **Two-Stage Queue Processing:** Fast client experience using FastAPI's asynchronous `BackgroundTasks` runner, architected to scale into Celery and Redis in production.
- **Security Hardening:** Strictly bounded CORS origins, input validation sanitization via Pydantic v2, file size constraints (max 5MB), and binary magic-bytes checking (preventing executable uploads).

---

## 🏗️ Folder Structure

```
capstone-project/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD Pipeline
├── backend/
│   ├── app/
│   │   ├── routers/           # API Routers (auth, jobs, resumes, audit, analytics)
│   │   ├── config.py          # Settings and environment variables
│   │   ├── database.py        # SQLAlchemy base and Session makers
│   │   ├── models.py          # SQLAlchemy SQLite / PostgreSQL Database tables
│   │   ├── schemas.py         # Pydantic request and response schemas
│   │   ├── auth.py            # Password hashing and JWT RBAC dependencies
│   │   ├── nlp_parser.py      # spaCy & PDF/DOCX extractors
│   │   ├── vector_search.py   # L2 Normalized Sentence Transformer matches
│   │   ├── websockets.py      # Real-time WebSocket connection manager
│   │   ├── background_tasks.py# Asynchronous parsing tasks
│   │   ├── ai_generator.py    # Mock/Live LLM suggestions and cover letters
│   │   └── main.py            # FastAPI root entry point
│   ├── requirements.txt       # Backend dependencies
│   └── nextgen_ats.db         # Self-contained SQLite database
└── frontend/
    ├── src/
    │   ├── components/        # Sidebar, Navbar, ScoreMeter, Dropzone
    │   ├── context/           # AuthContext (JWT + WebSockets), ThemeContext
    │   ├── pages/             # Landing, Dashboard, Jobs, Scanner, AI Assistant, Audit Logs
    │   ├── App.tsx            # Routes configuration and guards
    │   └── main.tsx           # React mounting entry
    ├── index.html             # SEO descriptive tags
    ├── package.json           # Frontend dependencies
    └── tailwind.config.js     # Glassmorphic themes & brand colors
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download spaCy English model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Note: On first startup, the system will auto-seed 3 demo accounts (`admin@nextgenats.com`, `recruiter@nextgenats.com`, `candidate@nextgenats.com`) with password `admin123`/`recruiter123`/`candidate123`.*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ Deployment & Production Scale

- **Database:** Swap the `DATABASE_URL` settings variable from SQLite to a PostgreSQL connection URI in your environment variables.
- **Heavy Workers:** Swap the `TASK_ENGINE` parameter in `.env` to `celery` and connect a Redis/RabbitMQ broker.
- **CI/CD:** On code pushes to GitHub, the workflow in `.github/workflows/ci.yml` will automatically spin up validation jobs to lint, execute backend pytests, and compile Vite production bundles.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
