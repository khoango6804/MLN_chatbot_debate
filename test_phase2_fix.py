#!/usr/bin/env python3

import requests
import json
import time
import random

def test_phase2_fix():
    """Test the Phase 2 data storage fix"""
    
    base_url = "http://localhost:8000"
    team_id = f"fix_test_{random.randint(100000, 999999)}"
    
    print("🧪 Testing Phase 2 Data Storage Fix")
    print(f"📋 Team ID: {team_id}")
    print("=" * 50)
    
    try:
        # Step 1: Start debate session
        print("\n1️⃣ Starting debate session...")
        start_data = {
            "team_id": team_id,
            "members": ["Fix Tester 1", "Fix Tester 2"],
            "course_code": "MLN111"
        }
        
        response = requests.post(f"{base_url}/api/debate/start", json=start_data)
        if response.status_code != 200:
            print(f"❌ Failed to start debate: {response.text}")
            return
        
        data = response.json()
        print(f"✅ Debate started: {data.get('topic', 'N/A')[:50]}...")
        
        # Step 2: Add team arguments
        print("\n2️⃣ Adding team arguments...")
        arguments = [
            "First argument with unique pattern AAAAAAAAAA",
            "Second argument with pattern BBBBBBBBBB", 
            "Third argument with pattern CCCCCCCCCC"
        ]
        
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase1", json={"arguments": arguments})
        if response.status_code != 200:
            print(f"❌ Failed to add arguments: {response.text}")
            return
        
        print("✅ Team arguments added")
        
        # Step 3: Get AI questions for Phase 2
        print("\n3️⃣ Getting AI questions for Phase 2...")
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase2", json={"team_arguments": arguments})
        if response.status_code != 200:
            print(f"❌ Failed to get AI questions: {response.text}")
            return
        
        data = response.json()
        ai_questions = data.get('data', {}).get('ai_questions', [])
        print(f"✅ Got {len(ai_questions)} AI questions")
        if ai_questions:
            print(f"   First question: {ai_questions[0][:60]}...")
        
        # Step 4: Start Phase 2
        print("\n4️⃣ Starting Phase 2...")
        response = requests.post(f"{base_url}/api/debate/{team_id}/phase2/start")
        if response.status_code != 200:
            print(f"❌ Failed to start Phase 2: {response.text}")
            return
        
        print("✅ Phase 2 started")
        
        # Step 5: Check initial turns data
        print("\n5️⃣ Checking initial turns data...")
        response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
        if response.status_code != 200:
            print(f"❌ Failed to get turns: {response.text}")
            return
        
        data = response.json()
        phase2_turns = data.get('phase2_turns', [])
        print(f"📊 Initial Phase 2 turns: {len(phase2_turns)}")
        
        for i, turn in enumerate(phase2_turns):
            print(f"   Turn {i+1}: asker={turn.get('asker')}, question={turn.get('question', '')[:30]}..., answer={turn.get('answer', 'None')}")
        
        # Step 6: Submit answers with test patterns
        test_answers = [
            "111111111111111111111111111111 This is my first answer to the AI question",
            "222222222222222222222222222222 This is my second detailed response", 
            "333333333333333333333333333333 This is my third comprehensive answer"
        ]
        
        for i, answer in enumerate(test_answers):
            print(f"\n6️⃣.{i+1} Submitting answer {i+1} with pattern...")
            
            # Find the most recent AI question to answer
            response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
            turns_data = response.json()
            current_turns = turns_data.get('phase2_turns', [])
            
            # Find the last AI question that doesn't have an answer yet
            ai_question = None
            for turn in reversed(current_turns):
                if turn.get('asker') == 'ai' and turn.get('question'):
                    ai_question = turn.get('question')
                    break
            
            if not ai_question and ai_questions:
                ai_question = ai_questions[0]  # Use first question as fallback
            
            if ai_question:
                # Submit answer
                answer_data = {
                    "answer": answer,
                    "asker": "student", 
                    "question": ai_question
                }
                
                response = requests.post(f"{base_url}/api/debate/{team_id}/ai-question/turn", json=answer_data)
                if response.status_code == 200:
                    print(f"   ✅ Answer {i+1} submitted successfully")
                else:
                    print(f"   ❌ Failed to submit answer {i+1}: {response.text}")
                
                # Small delay between submissions
                time.sleep(1)
            else:
                print(f"   ⚠️ No AI question found to answer")
        
        # Step 7: Final verification
        print("\n7️⃣ Final verification...")
        response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
        if response.status_code != 200:
            print(f"❌ Failed to get final turns: {response.text}")
            return
        
        data = response.json()
        final_turns = data.get('phase2_turns', [])
        print(f"📊 Final Phase 2 turns: {len(final_turns)}")
        
        # Analyze the data structure
        ai_questions_count = 0
        student_answers_count = 0
        
        print("\n📋 Final Turn Analysis:")
        for i, turn in enumerate(final_turns):
            asker = turn.get('asker')
            question = turn.get('question', '')
            answer = turn.get('answer', '')
            
            print(f"   Turn {i+1}: asker={asker}")
            
            if asker == 'ai' and question:
                ai_questions_count += 1
                print(f"     🤖 AI Question: {question[:50]}...")
            elif asker == 'student' and answer:
                student_answers_count += 1
                print(f"     👥 Student Answer: {answer[:50]}...")
                
                # Check for our test patterns
                patterns = ['111111111111', '222222222222', '333333333333']
                found_pattern = None
                for pattern in patterns:
                    if pattern in answer:
                        found_pattern = pattern
                        break
                
                if found_pattern:
                    print(f"     ✅ Found test pattern: {found_pattern}")
                else:
                    print(f"     ⚠️ No test pattern found")
        
        print(f"\n📈 Summary:")
        print(f"   AI Questions: {ai_questions_count}")
        print(f"   Student Answers: {student_answers_count}")
        
        # Check for the critical issue: missing first answer
        has_111_pattern = any('111111111111' in turn.get('answer', '') for turn in final_turns if turn.get('asker') == 'student')
        has_222_pattern = any('222222222222' in turn.get('answer', '') for turn in final_turns if turn.get('asker') == 'student')
        has_333_pattern = any('333333333333' in turn.get('answer', '') for turn in final_turns if turn.get('asker') == 'student')
        
        print(f"\n🔍 Pattern Check:")
        print(f"   111111... pattern found: {'✅' if has_111_pattern else '❌'}")
        print(f"   222222... pattern found: {'✅' if has_222_pattern else '❌'}")
        print(f"   333333... pattern found: {'✅' if has_333_pattern else '❌'}")
        
        if has_111_pattern and has_222_pattern and has_333_pattern:
            print("\n🎉 SUCCESS: All test patterns found! The fix is working correctly.")
        else:
            print("\n❌ FAILURE: Some test patterns are missing. The issue persists.")
        
        return team_id
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return None

if __name__ == "__main__":
    team_id = test_phase2_fix()
    if team_id:
        print(f"\n💡 You can check the export by visiting:")
        print(f"   http://localhost:8000/api/debate/{team_id}/export_docx") 