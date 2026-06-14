# Drug Nova 🔬

> AI-Powered Drug Repurposing Platform 

Drug Nova is a full-stack AI-assisted bioinformatics platform that surfaces compelling drug repurposing candidates using public biomedical datasets, explainable AI workflows, and an interactive **Live 3D Molecular Docking Sandbox**.

---

## ✨ Major Features

1. **AI Repurposing Engine:** Uses a context-aware Tiered Model to calculate repurposing viability across 6 major diseases, analyzing clinical evidence, binding affinity, and target overlaps.
2. **Interactive AI Assistant:** A persistent, site-aware chatbot powered by Gemini 2.5 Flash. It utilizes dynamic RAG (Retrieval-Augmented Generation) against local MongoDB datasets to answer questions about specific drugs, diseases, and proteins, while guiding users through the platform's features.
3. **Molecular Docking Sandbox:** Select any protein target and drug candidate to run a simulated physical docking protocol.
    - **Context-Aware Affinity:** Dynamically calculates true biological target compatibility vs random physical collision probability.
    - **Collision Physics:** Implements mathematical damped-cosine kinetic animations for realistic binding site settling.
4. **Knowledge Graph Explorer:** Interactive nodal visualization using React Flow to trace the biological pathways from Disease -> Gene -> Protein -> Drug.
5. **Protein 3D Sequence & Viewer:** Next-gen structure viewer using NGL/Mol* to visualize PDB and AlphaFold models with pLDDT confidence and binding pockets.

---

## ⚡ Quick Start

### 1. Database Setup
Create a `backend/.env` file:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=drug_nova
GEMINI_API_KEY=your_gemini_api_key_here
```

Seed the database:
```bash
cd backend
python scripts/seed_db.py
```

### 2. Run the App
**Backend** (Terminal 1)
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

App runs at: http://localhost:3000

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4
- **Backend:** FastAPI, Pydantic, Python
- **Database:** MongoDB Atlas
- **3D & Graphs:** NGL Viewer, React Flow, Framer Motion
- **AI:** Google Gemini 2.5 Flash

---

## ⚠️ Disclaimer
Drug Nova is a research exploration and demonstration tool. It does not constitute medical advice and is not a substitute for clinical trials or professional pharmaceutical analysis.
