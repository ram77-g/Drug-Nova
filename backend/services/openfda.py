import httpx
import logging

logger = logging.getLogger(__name__)

async def get_fda_adverse_events(drug_name: str):
    """
    Fetches the top 5 most common adverse events reported for a specific drug
    from the live OpenFDA database.
    Uses the free, unauthenticated OpenFDA API.
    """
    # OpenFDA search syntax: search for the active ingredient/product name, 
    # then count by the exact reaction medical term to get the top 5
    safe_name = drug_name.replace(" ", "+")
    url = f"https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:{safe_name}&count=patient.reaction.reactionmeddrapt.exact&limit=5"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            
            if response.status_code == 404:
                return {"results": [], "message": "No FDA adverse event data found for this drug."}
                
            response.raise_for_status()
            data = response.json()
            
            results = data.get("results", [])
            
            # Format nicely
            formatted_events = [
                {"reaction": item.get("term"), "count": item.get("count")} 
                for item in results
            ]
            
            return {
                "events": formatted_events,
                "source": "OpenFDA Live API"
            }
            
    except Exception as e:
        logger.error(f"Error fetching OpenFDA data for {drug_name}: {e}")
        return None
