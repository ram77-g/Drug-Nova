"""
Chatbot router.
Provides an interactive AI assistant powered by Gemini API, with dynamic RAG from MongoDB.
"""
import os
import re
from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from db.mongodb import get_db

router = APIRouter()

SITE_MAP_CONTEXT = """
You are the Drug-Nova AI Assistant, a biomedical chatbot integrated directly into the Drug-Nova platform.
Drug-Nova is a specialized web application for drug repurposing and protein analysis.

Platform Capabilities & Pages:
1. Search Page (/search): Search for a disease (e.g., Alzheimer, Breast Cancer) to see Repurposing Candidates and the Biological Knowledge Graph.
2. Knowledge Graph: A 3D physics simulation mapping Diseases to Genes, Proteins, and Drugs.
3. Prediction Engine: A panel showing drug mechanisms, targets, and an "Explain AI" button for detailed rationales.
4. Compare Proteins (/compare): Compare two proteins side-by-side. It features a sequence alignment matrix, a 3D dual viewer, physicochemical property profiling, and polypharmacology intersections (finding drugs that target both proteins). It also allows downloading comprehensive PDF/MD reports.
5. 3D Viewer: Displays proteins using NGL Viewer (Cartoon, Surface, Ball & Stick), confidence coloring (pLDDT), hydrophobicity, and binding pocket docking simulations.

Your Guidelines:
- You are a helpful, professional, and scientifically accurate assistant.
- Format your responses using Markdown. Use bullet points and bold text where appropriate to make it readable.
- If a user asks how to do something, guide them to the correct page or feature mentioned above.
- Below is dynamic context extracted from the database based on the user's latest query. Use it to answer specific questions about drugs or proteins.
"""

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Process a chat message using Gemini with RAG context."""
    user_messages = [m.content for m in req.messages if m.role == "user"]
    latest_query = user_messages[-1] if user_messages else ""
    
    # Simple RAG: Extract potential keywords from query to fetch from MongoDB
    db = get_db()
    context_data = []
    
    # Strip common words to find keywords (naive approach for speed)
    words = set(re.findall(r'\b[a-zA-Z0-9-]{3,}\b', latest_query.lower()))
    stop_words = {"what", "who", "how", "why", "the", "and", "for", "with", "about", "tell", "explain", "detail", "details"}
    keywords = words - stop_words
    
    if keywords:
        # Search drugs
        for kw in keywords:
            drug = await db.drugs.find_one({"name": {"$regex": kw, "$options": "i"}})
            if drug:
                context_data.append(f"Drug Found: {drug.get('name')}\nApproval: {drug.get('approval_status')}\nMechanism: {drug.get('mechanism')}\nTargets: {', '.join(drug.get('target_proteins', []))}")
                break # Just get top match for brevity
                
        # Search proteins
        for kw in keywords:
            protein = await db.proteins.find_one({"$or": [
                {"name": {"$regex": kw, "$options": "i"}},
                {"uniprot_id": {"$regex": kw, "$options": "i"}}
            ]})
            if protein:
                context_data.append(f"Protein Found: {protein.get('name')} (UniProt: {protein.get('uniprot_id')})\nFunction: {protein.get('function')}")
                break
                
    db_context = "\n\nDatabase Context:\n" + "\n---\n".join(context_data) if context_data else "\n\nDatabase Context: No specific local database records found for this query."
    
    try:
        from google import genai
        from google.genai import types
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return ChatResponse(reply="Error: GEMINI_API_KEY is not configured in the backend.")
            
        client = genai.Client(api_key=api_key)
        
        # Convert messages to Gemini format
        formatted_messages = []
        for m in req.messages:
            role = "model" if m.role == "assistant" else "user"
            # Gemini requires the first message in the history to be from the 'user'
            if not formatted_messages and role == "model":
                continue
            formatted_messages.append(types.Content(role=role, parts=[types.Part.from_text(text=m.content)]))
            
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=formatted_messages,
            config=types.GenerateContentConfig(
                system_instruction=SITE_MAP_CONTEXT + db_context
            )
        )
        return ChatResponse(reply=response.text)
        
    except Exception as e:
        import traceback
        print(f"Chatbot Error: {e}")
        traceback.print_exc()
        return ChatResponse(reply="I'm sorry, I encountered an error while processing your request. Please try again.")
