#!/usr/bin/env python3

import requests
import json
import time

def test_phase2_saving():
    base_url = "http://localhost:8000/api"
    
    # Test data
    team_id = "test_phase2_save_123"
    test_answers = [
        "1111111111111111111111111111111 first answer",  # Should be saved
        "2222222222222222222222222222222 second answer", # Should be saved
        "3333333333333333333333333333333 third answer"   # Should be saved
    ]
    
    print("=== TESTING PHASE 2 DATA SAVING ===")
    
    try:
        # 1. Create a new debate session
        print("1. Creating debate session...")
        create_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Test Member 1", "Test Member 2"],
            "course_code": "MLN111"
        })
        
        if create_response.status_code != 200:
            print(f"Failed to create session: {create_response.status_code}")
            print(create_response.text)
            return
            
        print(f"✅ Session created: {team_id}")
        
        # 2. Set stance
        print("2. Setting stance...")
        stance_response = requests.post(f"{base_url}/debate/{team_id}/stance", json={
            "stance": "ĐỒNG TÌNH"
        })
        print(f"Stance response: {stance_response.status_code}")
        
        # 3. Submit arguments for Phase 1
        print("3. Submitting Phase 1 arguments...")
        args_response = requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "arguments": ["Test argument 1", "Test argument 2"]
        })
        print(f"Arguments response: {args_response.status_code}")
        
        # 4. Get Phase 2 questions
        print("4. Getting Phase 2 questions...")
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": ["Test argument 1", "Test argument 2"]
        })
        
        if phase2_response.status_code != 200:
            print(f"Failed to get Phase 2 questions: {phase2_response.status_code}")
            print(phase2_response.text)
            return
            
        questions_data = phase2_response.json()
        ai_questions = questions_data.get("data", {}).get("ai_questions", [])
        print(f"✅ Got {len(ai_questions)} AI questions")
        
        # 5. Test answering questions
        print("\n5. Testing Phase 2 answers...")
        for i, answer in enumerate(test_answers):
            if i < len(ai_questions):
                question = ai_questions[i]
                print(f"\nTesting answer {i+1}: {answer[:30]}...")
                
                turn_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
                    "asker": "student",
                    "question": question,
                    "answer": answer
                })
                
                print(f"Turn response status: {turn_response.status_code}")
                if turn_response.status_code == 200:
                    turn_data = turn_response.json()
                    turns = turn_data.get("turns", [])
                    print(f"✅ Turn saved. Total turns: {len(turns)}")
                    
                    # Show last few turns
                    for turn in turns[-2:]:
                        asker = turn.get("asker", "unknown")
                        question_text = turn.get("question", "")[:30]
                        answer_text = turn.get("answer", "")[:30] if turn.get("answer") else "None"
                        print(f"   {asker}: Q:{question_text}... A:{answer_text}...")
                else:
                    print(f"❌ Failed to save turn: {turn_response.text}")
                
                time.sleep(1)  # Wait between requests
        
        # 6. Check final session state
        print("\n6. Checking final session state...")
        info_response = requests.get(f"{base_url}/debate/{team_id}/info")
        if info_response.status_code == 200:
            info_data = info_response.json()
            print(f"Final session info: {json.dumps(info_data, indent=2, ensure_ascii=False)}")
        
        # 7. Try export to see if data is preserved
        print("\n7. Testing export...")
        export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
        print(f"Export response status: {export_response.status_code}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_phase2_saving() 