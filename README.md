# Drug Nova 🔬

> AI-Powered Drug Repurposing Platform — Hackathon Edition

Drug Nova is a full-stack AI-assisted bioinformatics platform that surfaces compelling drug repurposing candidates using public biomedical datasets, explainable AI workflows, and cinematic scientific visualizations.

---

## ⚡ Quick Start

### 1. Start the Backend (Terminal 1)

```bash
# From project root
start-backend.bat
# OR manually:
cd Drug-Nova
venv\Scripts\activate
cd backend
uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 2. Start the Frontend (Terminal 2)

```bash
start-frontend.bat
# OR manually:
cd frontend
npm run dev
```

App runs at: http://localhost:3000

---

## 🏗 Project Structure

```
Drug-Nova/
├── frontend/                   # Next.js 16 + TypeScript
│   ├── app/
│   │   ├── page.tsx            # Landing page (Hero, Features, How it works)
│   │   ├── search/             # Disease search page
│   │   ├── results/            # Results dashboard
│   │   └── protein/            # 3D protein structure viewer
│   ├── components/
│   │   ├── landing/            # Hero, Features, HowItWorks
│   │   ├── layout/             # Navbar
│   │   ├── graph/              # Knowledge graph (React Flow)
│   │   ├── results/            # DrugCard, DiseaseOverview, AIExplanationPanel
│   │   ├── search/             # SearchBar with autocomplete
│   │   └── ui/                 # Badge, GlowButton, GlassCard, ScoreBar, LoadingSpinner
│   ├── hooks/                  # useDisease hook
│   ├── lib/                    # api.ts, utils.ts
│   └── types/                  # Shared TypeScript types
│
├── backend/                    # FastAPI + Python
│   ├── main.py                 # App entry + CORS
│   ├── routers/
│   │   ├── disease.py          # Disease search & suggestions
│   │   ├── drugs.py            # Drug candidate endpoints
│   │   ├── graph.py            # Knowledge graph builder
│   │   ├── ai_explain.py       # AI explanation engine
│   │   └── protein.py          # Protein structure metadata
│   ├── services/
│   │   ├── mock_data.py        # Curated biomedical mock datasets
│   │   └── scoring.py          # Multi-factor drug ranking pipeline
│   └── models/
│       └── schemas.py          # Pydantic models
│
└── venv/                       # Python virtual environment
```

---

## 🔬 Supported Diseases

| Disease | Genes | Drugs |
|---------|-------|-------|
| Alzheimer's Disease | APOE, APP, PSEN1, PSEN2, MAPT | 3 |
| Parkinson's Disease | SNCA, LRRK2, PARK7, PINK1 | 3 |
| Breast Cancer | BRCA1, BRCA2, ERBB2, PTEN | 2 |
| Type 2 Diabetes | INS, PPARG, IRS1, GLUT4 | 2 |
| COVID-19 | ACE2, TMPRSS2, IL6, STAT3 | 2 |
| Rheumatoid Arthritis | IL6, TNF, JAK1, TYK2 | 2 |

---

## 🤖 AI Explanations

Set your OpenAI API key in `backend/.env` for live AI-generated explanations:

```
OPENAI_API_KEY=your_key_here
```

Without a key, the platform uses scientifically grounded mock explanations.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Animations | Framer Motion |
| Graph | React Flow (@xyflow/react) |
| Protein 3D | AlphaFold DB (iframe embed) |
| Backend | FastAPI, Pydantic, Python 3.14 |
| AI | OpenAI GPT-4o-mini (with mock fallback) |

---

## ⚠️ Disclaimer

Drug Nova is a research exploration and demonstration tool. It does not constitute medical advice and is not a substitute for clinical trials or professional pharmaceutical analysis. All drug candidates are presented for hypothesis generation purposes only.
