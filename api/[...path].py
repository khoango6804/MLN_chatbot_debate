"""
Vercel Serverless Function - Catch-all route for FastAPI
Handles all /api/* requests using dynamic routing
"""
import sys
import os
from pathlib import Path

# Add backend directory to Python path  
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from mangum import Mangum
    from main import app
    
    # Create Mangum handler for FastAPI app
    mangum_handler = Mangum(app, lifespan="off")
except ImportError as e:
    print(f"Import error: {e}")
    mangum_handler = None

def handler(event, context):
    """
    Vercel serverless function handler for catch-all routes
    """
    if mangum_handler is None:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": {"detail": "Failed to initialize FastAPI app. Make sure mangum is installed."}
        }
    
    try:
        return mangum_handler(event, context)
    except Exception as e:
        print(f"Error in handler: {e}")
        import traceback
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": {"detail": str(e)}
        }

