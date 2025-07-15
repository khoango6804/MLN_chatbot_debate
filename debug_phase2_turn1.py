#!/usr/bin/env python3
"""
Debug script để tìm hiểu tại sao Turn 1 Phase 2 bị mất
"""

import requests
import json
import time

def debug_phase2_turn1():
    """Debug Phase 2 Turn 1 missing issue"""
    
    base_url = "http://localhost:8000/api"
    team_id = f"debug_turn1_{int(time.time())}"
    
    print("🔍 DEBUG PHASE 2 TURN 1 MISSING")
    print("=" * 50)
    
    try:
        # Step 1: Create session
        print("📝 Step 1: Creating session...")
        start_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Debug Student"],
            "course_code": "MLN111"
        })
        
        if start_response.status_code != 200:
            print(f"❌ Failed: {start_response.text}")
            return
        
        print(f"✅ Session created: {team_id}")
        
        # Step 2: Submit arguments
        print("\n📝 Step 2: Submitting arguments...")
        args_response = requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "team_id": team_id,
            "arguments": ["Debug argument 1", "Debug argument 2"]
        })
        
        if args_response.status_code != 200:
            print(f"❌ Failed: {args_response.text}")
            return
        
        # Step 3: Start Phase 2
        print("\n📝 Step 3: Starting Phase 2...")
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": ["Debug argument 1", "Debug argument 2"]
        })
        
        if phase2_response.status_code != 200:
            print(f"❌ Failed: {phase2_response.text}")
            return
        
        ai_questions = phase2_response.json()["data"]["ai_questions"]
        print(f"✅ Phase 2 started, got {len(ai_questions)} AI questions")
        
        # Step 4: Check turns after Phase 2 start
        print("\n🔍 Step 4: Checking turns after Phase 2 start...")
        turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if turns_response.status_code == 200:
            turns_data = turns_response.json()
            phase2_turns = turns_data.get('phase2_turns', [])
            print(f"📊 Phase 2 turns after start: {len(phase2_turns)}")
            for i, turn in enumerate(phase2_turns):
                print(f"   Turn {i+1}: {turn.get('asker')} - Q: '{turn.get('question', '')[:30]}' A: '{turn.get('answer', 'None')[:30]}'")
        
        # Step 5: Submit FIRST answer (this should be Turn 1 answer)
        print(f"\n📝 Step 5: Submitting FIRST answer (Turn 1)...")
        first_answer = "111111111111111111111111 This is my FIRST answer that should not be lost"
        
        answer1_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
            "answer": first_answer,
            "asker": "student",
            "question": ai_questions[0] if ai_questions else "First AI Question"
        })
        
        if answer1_response.status_code != 200:
            print(f"❌ Failed to submit first answer: {answer1_response.text}")
            return
        
        print(f"✅ First answer submitted: {first_answer[:50]}...")
        
        # Step 6: Check turns after first answer
        print("\n🔍 Step 6: Checking turns after first answer...")
        turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if turns_response.status_code == 200:
            turns_data = turns_response.json()
            phase2_turns = turns_data.get('phase2_turns', [])
            print(f"📊 Phase 2 turns after first answer: {len(phase2_turns)}")
            
            found_first_answer = False
            for i, turn in enumerate(phase2_turns):
                asker = turn.get('asker')
                question = turn.get('question', '')
                answer = turn.get('answer', '')
                
                print(f"   Turn {i+1}: {asker} - Q: '{question[:30]}...' A: '{answer[:30]}...'")
                
                if '111111111111' in answer:
                    found_first_answer = True
                    print(f"      ✅ FOUND: First answer with 111111 pattern in Turn {i+1}")
            
            if not found_first_answer:
                print(f"      ❌ PROBLEM: First answer with 111111 pattern NOT FOUND!")
                
                # Check if it's in a different turn
                for i, turn in enumerate(phase2_turns):
                    answer = turn.get('answer', '')
                    if 'FIRST answer' in answer:
                        print(f"      📍 Found FIRST answer text in Turn {i+1}: {answer[:50]}...")
        
        # Step 7: Submit second answer
        print(f"\n📝 Step 7: Submitting second answer...")
        
        # Generate next AI question first
        gen_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/generate")
        if gen_response.status_code == 200:
            print("✅ Next AI question generated")
        
        second_answer = "222222222222222222222222 This is my SECOND answer"
        answer2_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
            "answer": second_answer,
            "asker": "student", 
            "question": ai_questions[1] if len(ai_questions) > 1 else "Second AI Question"
        })
        
        if answer2_response.status_code == 200:
            print(f"✅ Second answer submitted: {second_answer[:50]}...")
        
        # Step 8: Final check
        print(f"\n🔍 Step 8: Final turns check...")
        turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if turns_response.status_code == 200:
            turns_data = turns_response.json()
            phase2_turns = turns_data.get('phase2_turns', [])
            print(f"📊 Final Phase 2 turns: {len(phase2_turns)}")
            
            first_found = False
            second_found = False
            
            for i, turn in enumerate(phase2_turns):
                answer = turn.get('answer', '')
                print(f"   Turn {i+1}: {turn.get('asker')} - Answer: '{answer[:40]}...'")
                
                if '111111111111' in answer:
                    first_found = True
                    print(f"      ✅ Turn {i+1}: Contains FIRST answer (111111)")
                    
                if '222222222222' in answer:
                    second_found = True
                    print(f"      ✅ Turn {i+1}: Contains SECOND answer (222222)")
            
            print(f"\n🎯 RESULT SUMMARY:")
            print(f"   First answer (111111) found: {'✅ YES' if first_found else '❌ NO'}")
            print(f"   Second answer (222222) found: {'✅ YES' if second_found else '❌ NO'}")
            
            if not first_found:
                print(f"\n🚨 CONFIRMED ISSUE: First answer is being lost!")
                print(f"   This explains why your 111111... pattern disappears")
            else:
                print(f"\n🎉 NO ISSUE: Both answers are properly saved")
        
        print(f"\n📄 Export test URL: http://localhost:8000/api/debate/{team_id}/export_docx")
        
    except Exception as e:
        print(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_phase2_turn1() 