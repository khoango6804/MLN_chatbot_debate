#!/usr/bin/env python3

import requests
import json
from datetime import datetime

def check_and_test_sessions():
    base_url = "http://localhost:8000/api"
    
    print("🎯 MLN DEBATE AUTO SESSION CHECKER & TESTER")
    print("=" * 60)
    
    # 1. Check current active sessions
    print("1. Kiểm tra active sessions...")
    try:
        response = requests.get(f"{base_url}/admin/sessions")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get("active", [])
            
            print(f"✅ Tìm thấy {len(active_sessions)} active sessions:")
            
            for i, session in enumerate(active_sessions, 1):
                team_id = session.get("team_id", "Unknown")
                topic = session.get("topic", "Unknown")[:40]
                phase = session.get("current_phase", "Unknown")
                
                print(f"   {i}. {team_id}")
                print(f"      Topic: {topic}...")
                print(f"      Phase: {phase}")
                
                # Quick inspect each session
                print(f"      Inspecting {team_id}...")
                info_response = requests.get(f"{base_url}/debate/{team_id}/info")
                if info_response.status_code == 200:
                    info_data = info_response.json()
                    print(f"      ✅ Session hoạt động: {info_data.get('status', 'Unknown')}")
                    
                    # Test export
                    export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
                    if export_response.status_code == 200:
                        print(f"      ✅ Export successful")
                    else:
                        print(f"      ❌ Export failed: {export_response.status_code}")
                else:
                    print(f"      ❌ Cannot get info: {info_response.status_code}")
                print()
                
        else:
            print(f"❌ Cannot get sessions: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking sessions: {e}")
    
    # 2. Create new test session with Phase 2 patterns
    print("\n" + "=" * 60)
    print("2. Tạo session mới để test Phase 2 fix...")
    
    timestamp = datetime.now().strftime("%H%M%S")
    team_id = f"auto_test_{timestamp}"
    
    try:
        # Create session
        print(f"   Creating session: {team_id}")
        create_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Auto Tester", "Phase2 Debugger"],
            "course_code": "MLN111"
        })
        
        if create_response.status_code != 200:
            print(f"   ❌ Create failed: {create_response.text}")
            return
            
        print(f"   ✅ Session created: {team_id}")
        
        # Set stance
        requests.post(f"{base_url}/debate/{team_id}/stance", json={"stance": "ĐỒNG TÌNH"})
        
        # Submit arguments
        requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "arguments": ["Auto test argument for Phase 2 debugging"]
        })
        
        # Get Phase 2 questions
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": ["Auto test argument for Phase 2 debugging"]
        })
        
        if phase2_response.status_code != 200:
            print(f"   ❌ Phase 2 failed: {phase2_response.text}")
            return
            
        questions_data = phase2_response.json()
        ai_questions = questions_data.get("data", {}).get("ai_questions", [])
        print(f"   ✅ Got {len(ai_questions)} AI questions")
        
        # Test with the exact patterns you mentioned
        test_patterns = [
            "1111111111111111111111111111111 đây là câu trả lời đầu tiên mà trước đây bị thiếu",
            "2222222222222222222222222222222 đây là câu trả lời thứ hai",  
            "3333333333333333333333333333333 đây là câu trả lời thứ ba"
        ]
        
        print(f"\n   Testing với {len(test_patterns)} patterns...")
        saved_answers = []
        
        for i, pattern in enumerate(test_patterns):
            if i < len(ai_questions):
                question = ai_questions[i]
                print(f"   Testing pattern {i+1}: {pattern[:30]}...")
                
                turn_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
                    "asker": "student", 
                    "question": question,
                    "answer": pattern
                })
                
                if turn_response.status_code == 200:
                    turn_data = turn_response.json()
                    turns = turn_data.get("turns", [])
                    print(f"   ✅ Saved successfully. Total turns: {len(turns)}")
                    
                    # Verify our answer is in the turns
                    for turn in turns:
                        if turn.get("asker") == "student" and turn.get("answer"):
                            answer_text = turn.get("answer", "")
                            if f"{i+1}{i+1}{i+1}{i+1}" in answer_text:  # 1111, 2222, 3333
                                saved_answers.append(answer_text[:50])
                                print(f"   ✅ Verified pattern in turn: {answer_text[:40]}...")
                                break
                else:
                    print(f"   ❌ Save failed: {turn_response.status_code}")
        
        print(f"\n📊 FINAL RESULTS:")
        print(f"   Test session: {team_id}")
        print(f"   Patterns tested: {len(test_patterns)}")
        print(f"   Successfully saved: {len(saved_answers)}")
        
        if len(saved_answers) == len(test_patterns):
            print(f"   🎉 ALL PATTERNS SAVED - Phase 2 fix is working!")
        else:
            print(f"   ⚠️  Some patterns missing - need investigation")
            
        # Test export with new data
        print(f"\n   Testing export with new fixed logic...")
        export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
        if export_response.status_code == 200:
            print(f"   ✅ Export successful - new logic working")
        else:
            print(f"   ❌ Export failed: {export_response.status_code}")
            
        print(f"\n✅ Test session created: {team_id}")
        print(f"   You can now test this session in the frontend!")
        
    except Exception as e:
        print(f"❌ Error creating test session: {e}")

if __name__ == "__main__":
    check_and_test_sessions() 