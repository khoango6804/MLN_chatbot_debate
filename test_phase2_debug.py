#!/usr/bin/env python3

import requests
import json

# Test current session data structure
def test_phase2_structure():
    base_url = "http://localhost:8000/api"
    
    # Get active sessions from admin endpoint
    try:
        response = requests.get(f"{base_url}/admin/sessions")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get("active", [])
            
            if active_sessions:
                # Get first active session for testing
                session = active_sessions[0]
                team_id = session["team_id"]
                
                print(f"=== TESTING SESSION: {team_id} ===")
                
                # Get session info
                info_response = requests.get(f"{base_url}/debate/{team_id}/info")
                if info_response.status_code == 200:
                    info_data = info_response.json()
                    print(f"Session Info: {json.dumps(info_data, indent=2, ensure_ascii=False)}")
                
                # Try to export to see actual structure
                export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
                print(f"Export response status: {export_response.status_code}")
                
            else:
                print("No active sessions found")
        else:
            print(f"Failed to get sessions: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_phase2_structure() 