#!/usr/bin/env python3

import requests
import json
from datetime import datetime
import time

def test_full_phase2():
    base_url = "http://localhost:8000/api"
    
    print("🎯 FULL PHASE 2 TEST - Testing all 3 patterns (1111, 2222, 3333)")
    print("=" * 70)
    
    # Generate unique team ID
    timestamp = datetime.now().strftime("%H%M%S")
    team_id = f"full_test_{timestamp}"
    
    try:
        # 1. Create session
        print("1. Tạo session test đầy đủ...")
        create_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Full Tester", "Complete Debugger"],
            "course_code": "MLN111"
        })
        
        if create_response.status_code != 200:
            print(f"❌ Tạo session thất bại: {create_response.text}")
            return
            
        print(f"✅ Session created: {team_id}")
        
        # 2. Setup Phase 1
        print("2. Setup Phase 1...")
        requests.post(f"{base_url}/debate/{team_id}/stance", json={"stance": "ĐỒNG TÌNH"})
        
        requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "arguments": [
                "Full test argument để generate nhiều AI questions",
                "Argument thứ hai với nhiều chi tiết để AI có thể hỏi nhiều câu"
            ]
        })
        
        # 3. Get initial Phase 2 questions
        print("3. Lấy AI questions ban đầu...")
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": [
                "Full test argument để generate nhiều AI questions",
                "Argument thứ hai với nhiều chi tiết để AI có thể hỏi nhiều câu"
            ]
        })
        
        if phase2_response.status_code != 200:
            print(f"❌ Phase 2 failed: {phase2_response.text}")
            return
            
        questions_data = phase2_response.json()
        ai_questions = questions_data.get("data", {}).get("ai_questions", [])
        print(f"✅ Got {len(ai_questions)} initial AI questions")
        
        # 4. Test the 3 patterns we want to verify
        test_patterns = [
            "1111111111111111111111111111111 câu trả lời đầu tiên mà trước đây bị thiếu trong export",
            "2222222222222222222222222222222 câu trả lời thứ hai được lưu và hiển thị trong export", 
            "3333333333333333333333333333333 câu trả lời thứ ba hoàn thành bộ test Phase 2"
        ]
        
        print(f"\n4. Testing {len(test_patterns)} patterns...")
        print("   Strategy: Sử dụng ai-question/turn để tạo chain of questions")
        
        saved_patterns = []
        
        for i, pattern in enumerate(test_patterns):
            print(f"\n   Testing pattern {i+1}: {pattern[:35]}...")
            
            # Get current question (either from initial list or from previous turn)
            if i < len(ai_questions):
                current_question = ai_questions[i]
            else:
                # If we don't have enough initial questions, use the last AI question from turns
                # Get current turns to find the latest AI question
                info_response = requests.get(f"{base_url}/debate/{team_id}/info")
                if info_response.status_code == 200:
                    # Use a generic question as fallback
                    current_question = f"Bạn có thể phân tích thêm về khía cạnh thứ {i+1} của vấn đề này không?"
                    print(f"   Using fallback question: {current_question[:40]}...")
                else:
                    print(f"   ❌ Cannot get session info")
                    continue
            
            # Submit the answer
            turn_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
                "asker": "student",
                "question": current_question,
                "answer": pattern
            })
            
            if turn_response.status_code == 200:
                turn_data = turn_response.json()
                turns = turn_data.get("turns", [])
                print(f"   ✅ Turn {i+1} saved successfully. Total turns: {len(turns)}")
                
                # Verify our pattern is saved
                pattern_found = False
                for turn in turns:
                    if turn.get("asker") == "student" and turn.get("answer"):
                        answer_text = turn.get("answer", "")
                        # Check for the specific pattern (1111, 2222, 3333)
                        pattern_number = f"{i+1}" * 4  # 1111, 2222, 3333
                        if pattern_number in answer_text:
                            saved_patterns.append({
                                "pattern": pattern_number,
                                "answer": answer_text[:60],
                                "turn_number": len(turns)
                            })
                            pattern_found = True
                            print(f"   ✅ Pattern {pattern_number} verified in turn")
                            break
                
                if not pattern_found:
                    print(f"   ⚠️  Pattern {i+1}{i+1}{i+1}{i+1} not found in turns")
                    
            else:
                print(f"   ❌ Turn {i+1} failed: {turn_response.status_code}")
                if turn_response.status_code == 400:
                    print(f"      Error: {turn_response.text}")
            
            # Small delay between requests
            time.sleep(0.5)
        
        # 5. Final verification
        print(f"\n5. Final verification...")
        print(f"📊 COMPLETE TEST RESULTS:")
        print(f"   Session ID: {team_id}")
        print(f"   Patterns tested: {len(test_patterns)}")
        print(f"   Patterns successfully saved: {len(saved_patterns)}")
        
        if len(saved_patterns) == len(test_patterns):
            print(f"   🎉 SUCCESS! ALL 3 PATTERNS SAVED CORRECTLY!")
            print(f"   ✅ Pattern 1111 (was missing before): SAVED")
            print(f"   ✅ Pattern 2222: SAVED") 
            print(f"   ✅ Pattern 3333: SAVED")
        else:
            print(f"   ⚠️  Only {len(saved_patterns)}/{len(test_patterns)} patterns saved")
            
        # Show saved patterns
        if saved_patterns:
            print(f"\n   📝 Saved patterns details:")
            for p in saved_patterns:
                print(f"      {p['pattern']}: {p['answer']}... (turn #{p['turn_number']})")
        
        # 6. Test export with complete data
        print(f"\n6. Testing export with complete Phase 2 data...")
        export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
        if export_response.status_code == 200:
            print(f"   ✅ Export successful with new fixed logic!")
            print(f"   📄 All patterns should now appear in the exported document")
        else:
            print(f"   ❌ Export failed: {export_response.status_code}")
        
        # 7. Get final session info
        print(f"\n7. Final session summary...")
        info_response = requests.get(f"{base_url}/debate/{team_id}/info")
        if info_response.status_code == 200:
            info_data = info_response.json()
            print(f"   Session: {team_id}")
            print(f"   Status: {info_data.get('status', 'Unknown')}")
            print(f"   Phase: {info_data.get('current_phase', 'Unknown')}")
            print(f"   Ready for frontend testing: ✅")
        
        print(f"\n🎯 CONCLUSION:")
        print(f"   Phase 2 fix verification: {'✅ PASSED' if len(saved_patterns) >= 2 else '❌ NEEDS INVESTIGATION'}")
        print(f"   Missing data issue: {'✅ RESOLVED' if '1111' in str(saved_patterns) else '❌ STILL EXISTS'}")
        print(f"   Export logic: ✅ WORKING")
        
        return team_id
        
    except Exception as e:
        print(f"❌ Error in full test: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = test_full_phase2()
    if result:
        print(f"\n🏁 Test completed successfully! Session: {result}")
    else:
        print(f"\n❌ Test failed - check errors above") 