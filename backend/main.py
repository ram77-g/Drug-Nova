"""
Drug Nova - FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import disease, drugs, graph, ai_explain, protein

load_dotenv()

from contextlib import asynccontextmanager
from db.mongodb import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="Drug Nova API",
    description="AI-powered drug repurposing platform backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow local Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(disease.router, prefix="/api/disease", tags=["Disease"])
app.include_router(drugs.router, prefix="/api/drugs", tags=["Drugs"])
app.include_router(graph.router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(ai_explain.router, prefix="/api/ai", tags=["AI Explanation"])
app.include_router(protein.router, prefix="/api/protein", tags=["Protein"])


@app.get("/")
async def root():
    return {"message": "Drug Nova API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
