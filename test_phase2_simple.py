#!/usr/bin/env python3

import requests
import json
import random

def test_simple():
    base_url = "http://localhost:8000/api"
    
    # Generate random team ID
    team_id = f"debug_test_{random.randint(1000, 9999)}"
    
    print(f"=== TESTING PHASE 2 SAVING: {team_id} ===")
    
    try:
        # Create session
        create_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Debug Tester"],
            "course_code": "MLN111"
        })
        
        if create_response.status_code != 200:
            print(f"❌ Create failed: {create_response.text}")
            return
            
        print(f"✅ Created session: {team_id}")
        
        # Set stance
        requests.post(f"{base_url}/debate/{team_id}/stance", json={"stance": "ĐỒNG TÌNH"})
        
        # Submit args
        requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "arguments": ["Debug argument"]
        })
        
        # Get Phase 2
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": ["Debug argument"]
        })
        
        questions_data = phase2_response.json()
        ai_questions = questions_data.get("data", {}).get("ai_questions", [])
        
        if not ai_questions:
            print("❌ No AI questions generated")
            return
            
        # Test with the problematic pattern
        test_answer = "111111111111111111111111111111111 this is my first answer that should be saved"
        question = ai_questions[0]
        
        print(f"Testing answer: {test_answer[:30]}...")
        
        turn_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
            "asker": "student",
            "question": question,
            "answer": test_answer
        })
        
        print(f"Turn response: {turn_response.status_code}")
        if turn_response.status_code == 200:
            turn_data = turn_response.json()
            turns = turn_data.get("turns", [])
            print(f"✅ Total turns: {len(turns)}")
            
            # Check if our answer is saved
            for i, turn in enumerate(turns):
                asker = turn.get("asker")
                answer = turn.get("answer")
                if asker == "student" and answer and "111111" in answer:
                    print(f"✅ Found our answer in turn {i+1}: {answer[:50]}...")
                    return True
                    
            print("❌ Our answer with '111111' not found in turns")
            for i, turn in enumerate(turns):
                print(f"   Turn {i+1}: {turn.get('asker')} - {turn.get('answer', 'no answer')[:30]}...")
        else:
            print(f"❌ Turn failed: {turn_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_simple() 