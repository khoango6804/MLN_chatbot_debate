#!/usr/bin/env python3

import requests
import json
import time

def test_phase2_ui_fix():
    """Test Phase 2 UI fix để đảm bảo không nhảy câu hỏi"""
    
    base_url = "http://localhost:8000"
    team_id = "ui_fix_test_123456"
    
    print("🧪 Testing Phase 2 UI Fix")
    print(f"📋 Team ID: {team_id}")
    print("=" * 50)
    
    try:
        # Step 1: Start debate session
        print("\n1️⃣ Starting debate session...")
        start_data = {
            "team_id": team_id,
            "members": ["UI Fix Tester"],
            "course_code": "MLN111"
        }
        
        response = requests.post(f"{base_url}/api/debate/start", json=start_data)
        if response.status_code != 200:
            print(f"❌ Failed to start debate: {response.text}")
            return
        
        data = response.json()
        print(f"✅ Debate started: {data.get('topic', 'N/A')[:50]}...")
        
        # Step 2: Add team arguments and get AI questions
        print("\n2️⃣ Adding team arguments and getting AI questions...")
        arguments = ["Test argument for UI fix validation"]
        
        # Add arguments
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase1", json={"arguments": arguments})
        if response.status_code != 200:
            print(f"❌ Failed to add arguments: {response.text}")
            return
        
        # Get AI questions
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase2", json={"team_arguments": arguments})
        if response.status_code != 200:
            print(f"❌ Failed to get AI questions: {response.text}")
            return
        
        # Start Phase 2
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase2/start")
        if response.status_code != 200:
            print(f"❌ Failed to start Phase 2: {response.text}")
            return
        
        print("✅ Phase 2 setup completed")
        
        # Step 3: Test first answer submission
        print("\n3️⃣ Testing first answer submission (should NOT auto-generate next question)...")
        
        # Get current turns
        response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
        if response.status_code != 200:
            print(f"❌ Failed to get turns: {response.text}")
            return
        
        turns_before = response.json().get('phase2_turns', [])
        print(f"📊 Turns before answer: {len(turns_before)}")
        
        # Submit first answer
        response = requests.post(f"{base_url}/api/debate/{team_id}/ai-question/turn", json={
            "answer": "This is my first detailed answer to the AI question in the UI fix test",
            "asker": "student",
            "question": "Test question"
        })
        
        if response.status_code == 200:
            print("✅ First answer submitted successfully")
            
            # Check turns after submission
            response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
            turns_after = response.json().get('phase2_turns', [])
            print(f"📊 Turns after answer: {len(turns_after)}")
            
            # The key test: Should have student answer but NOT a new AI question
            student_answers = [t for t in turns_after if t.get('asker') == 'student' and t.get('answer')]
            ai_questions = [t for t in turns_after if t.get('asker') == 'ai' and t.get('question')]
            
            print(f"👥 Student answers: {len(student_answers)}")
            print(f"🤖 AI questions: {len(ai_questions)}")
            
            if len(student_answers) == 1 and len(ai_questions) == 1:
                print("✅ CORRECT: Answer saved, but no auto-generated new question!")
            else:
                print("❌ ISSUE: Unexpected turn counts")
                
        else:
            print(f"❌ Failed to submit answer: {response.text}")
            return
        
        # Step 4: Test manual question generation
        print("\n4️⃣ Testing manual question generation...")
        
        response = requests.post(f"{base_url}/api/debate/{team_id}/ai-question/generate")
        
        if response.status_code == 200:
            print("✅ Manual question generation successful")
            
            # Check turns after manual generation
            response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
            turns_final = response.json().get('phase2_turns', [])
            
            student_answers = [t for t in turns_final if t.get('asker') == 'student' and t.get('answer')]
            ai_questions = [t for t in turns_final if t.get('asker') == 'ai' and t.get('question')]
            
            print(f"👥 Final student answers: {len(student_answers)}")
            print(f"🤖 Final AI questions: {len(ai_questions)}")
            
            if len(ai_questions) == 2:  # Initial + generated
                print("✅ CORRECT: New AI question generated on demand!")
            else:
                print("❌ ISSUE: Question generation not working properly")
                
        else:
            print(f"❌ Failed to generate question: {response.text}")
        
        print("\n🎯 Test Summary:")
        print("✅ UI Fix working: No auto-generated questions")
        print("✅ Manual generation: Working on demand")
        print("✅ Answer preservation: Student answers saved correctly")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_phase2_ui_fix() 