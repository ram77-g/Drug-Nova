# Drug Nova 🔬

> AI-Powered Drug Repurposing Platform — Hackathon Edition

Drug Nova is a full-stack AI-assisted bioinformatics platform that surfaces compelling drug repurposing candidates using public biomedical datasets, explainable AI workflows, and interactive 3D protein structures.

---

## ⚡ Quick Start

### 1. Database Setup

Create a `backend/.env` file with your MongoDB connection string and OpenAI key:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=drug_nova
OPENAI_API_KEY=your_key_here
```

To seed your database with the curated biomedical datasets:
```bash
cd backend
python scripts/seed_db.py
```

### 2. Start the Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 3. Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```
App runs at: http://localhost:3000

---

## 🏗 Project Structure

```
Drug-Nova/
├── frontend/                   # Next.js 16 + TypeScript
│   ├── app/                    # Pages: Landing, Search, Results, Protein Viewer
│   ├── components/             # React Components (UI, Graph, Viewer)
│   └── public/structures/      # Downloaded .pdb AlphaFold structures
│
├── backend/                    # FastAPI + Python
│   ├── main.py                 # App entry + CORS
│   ├── routers/                # API Endpoints
│   ├── db/                     # MongoDB connection logic
│   ├── scripts/                # Database seeding & AlphaFold downloader
│   └── services/               # Scoring & original mock datasets
```

---

## 🔬 Supported Diseases & Targets

The platform is seeded with 5 associated genes and exactly 5 linked target proteins for each of the following diseases:

| Disease | Example Targets (Genes/Proteins) | Drugs |
|---------|--------------------------------|-------|
| Alzheimer's Disease | APOE, APP, PSEN1, PSEN2, MAPT | 3 |
| Parkinson's Disease | SNCA, LRRK2, PARK7, PINK1, PARKIN | 3 |
| Breast Cancer | BRCA1, ERBB2, PTEN, TP53 | 2 |
| Type 2 Diabetes | INS, PPARG, IRS1, GLUT4, TCF7L2 | 2 |
| COVID-19 | ACE2, TMPRSS2, IL6, STAT3, TNF | 2 |
| Rheumatoid Arthritis | IL6, TNF, JAK1, TYK2, PTPN22 | 2 |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Database | MongoDB Atlas (Motor Async driver) |
| Animations | Framer Motion |
| Graph | React Flow (@xyflow/react) |
| Protein 3D | Mol* Viewer / NGL (AlphaFold & RCSB PDB) |
| Backend | FastAPI, Pydantic, Python |
| AI | OpenAI GPT-4o-mini (with mock fallback) |

---

## ⚠️ Disclaimer

Drug Nova is a research exploration and demonstration tool. It does not constitute medical advice and is not a substitute for clinical trials or professional pharmaceutical analysis. All drug candidates are presented for hypothesis generation purposes only.
