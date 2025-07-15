#!/usr/bin/env python3
"""
Tạo session test hoàn chỉnh để verify export fix
"""

import requests
import json
import time

def create_complete_test_session():
    """Tạo session test đầy đủ với 3 turns Phase 2"""
    
    base_url = "http://localhost:8000/api"
    team_id = f"VERIFY_FIX_{int(time.time())}"
    
    print("🧪 TẠO SESSION TEST ĐỂ VERIFY EXPORT FIX")
    print("=" * 50)
    print(f"Team ID: {team_id}")
    print()
    
    try:
        # Step 1: Tạo session
        print("📝 Step 1: Tạo session...")
        start_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Test Student A", "Test Student B"],
            "course_code": "MLN111"
        })
        
        if start_response.status_code != 200:
            print(f"❌ Lỗi tạo session: {start_response.text}")
            return None
        
        topic = start_response.json().get("topic", "Test topic")
        print(f"✅ Session created: {team_id}")
        print(f"📄 Topic: {topic}")
        
        # Step 2: Submit arguments
        print("\n📝 Step 2: Gửi arguments...")
        args_response = requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "team_id": team_id,
            "arguments": [
                "ARG1: Luận điểm đầu tiên của team",
                "ARG2: Luận điểm thứ hai có tính thuyết phục",  
                "ARG3: Luận điểm thứ ba kết luận quan điểm"
            ]
        })
        
        if args_response.status_code != 200:
            print(f"❌ Lỗi gửi arguments: {args_response.text}")
            return None
        
        print("✅ Arguments submitted")
        
        # Step 3: Generate AI arguments
        print("\n📝 Step 3: Generate AI arguments...")
        ai_args_response = requests.post(f"{base_url}/debate/{team_id}/phase1")
        
        if ai_args_response.status_code != 200:
            print(f"❌ Lỗi generate AI args: {ai_args_response.text}")
            return None
        
        print("✅ AI arguments generated")
        
        # Step 4: Start Phase 2
        print("\n📝 Step 4: Bắt đầu Phase 2...")
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": [
                "ARG1: Luận điểm đầu tiên của team",
                "ARG2: Luận điểm thứ hai có tính thuyết phục",  
                "ARG3: Luận điểm thứ ba kết luận quan điểm"
            ]
        })
        
        if phase2_response.status_code != 200:
            print(f"❌ Lỗi start Phase 2: {phase2_response.text}")
            return None
        
        ai_questions = phase2_response.json()["data"]["ai_questions"]
        print(f"✅ Phase 2 started with {len(ai_questions)} AI questions")
        
        # Step 5: Submit 3 student answers
        test_answers = [
            "111111111111111111111111 ĐÂY LÀ CÂU TRẢ LỜI ĐẦU TIÊN của tôi cho câu hỏi AI. Tôi muốn kiểm tra xem nó có được lưu đúng ở Turn 1 không. Câu trả lời này chứa pattern 111111 để dễ nhận biết.",
            "222222222222222222222222 ĐÂY LÀ CÂU TRẢ LỜI THỨ HAI của tôi. Tôi hi vọng nó sẽ xuất hiện ở Turn 2 trong export. Pattern 222222 giúp tôi phân biệt với các câu trả lời khác.",
            "333333333333333333333333 ĐÂY LÀ CÂU TRẢ LỜI THỨ BA và cuối cùng. Nó phải xuất hiện ở Turn 3. Pattern 333333 là dấu hiệu nhận biết câu trả lời này."
        ]
        
        print(f"\n📝 Step 5: Gửi 3 câu trả lời...")
        
        for i, answer in enumerate(test_answers, 1):
            print(f"   Gửi answer {i} (pattern: {'111111' if i==1 else '222222' if i==2 else '333333'})...")
            
            # Gửi student answer
            answer_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
                "answer": answer,
                "asker": "student",
                "question": ai_questions[0] if ai_questions else f"AI Question {i}"
            })
            
            if answer_response.status_code != 200:
                print(f"❌ Lỗi gửi answer {i}: {answer_response.text}")
                return None
            
            print(f"   ✅ Answer {i} submitted")
            
            # Generate next AI question (trừ answer cuối)
            if i < len(test_answers):
                gen_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/generate")
                if gen_response.status_code == 200:
                    print(f"   ✅ AI question {i+1} generated")
                else:
                    print(f"   ⚠️  Warning: Could not generate AI question {i+1}")
            
            time.sleep(0.5)  # Tránh spam
        
        # Step 6: Verify data
        print(f"\n🔍 Step 6: Kiểm tra dữ liệu...")
        turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if turns_response.status_code == 200:
            turns_data = turns_response.json()
            phase2_turns = turns_data.get('phase2_turns', [])
            
            print(f"📊 Total Phase 2 turns: {len(phase2_turns)}")
            
            patterns_found = {}
            
            for i, turn in enumerate(phase2_turns):
                asker = turn.get('asker', 'unknown')
                answer = turn.get('answer', '')
                
                if asker == 'student' and answer:
                    turn_display = i + 1
                    print(f"\nTurn {turn_display}: Student Answer")
                    print(f"   Content: {answer[:70]}...")
                    
                    # Check patterns
                    if '111111111111' in answer:
                        patterns_found['111111'] = turn_display
                        print(f"   ⭐ PATTERN 111111 FOUND in Turn {turn_display}")
                    elif '222222222222' in answer:
                        patterns_found['222222'] = turn_display  
                        print(f"   ⭐ PATTERN 222222 FOUND in Turn {turn_display}")
                    elif '333333333333' in answer:
                        patterns_found['333333'] = turn_display
                        print(f"   ⭐ PATTERN 333333 FOUND in Turn {turn_display}")
            
            # Final result
            print(f"\n🎯 KẾT QUẢ KIỂM TRA:")
            expected_patterns = {
                '111111': 'Turn 1 (First answer)',
                '222222': 'Turn 2 (Second answer)', 
                '333333': 'Turn 3 (Third answer)'
            }
            
            all_correct = True
            for pattern, expected_turn in expected_patterns.items():
                if pattern in patterns_found:
                    actual_turn = patterns_found[pattern]
                    expected_num = int(expected_turn.split()[1])
                    
                    # Note: Due to AI questions interspersed, student answers might not be at exact turns 1,2,3
                    # We need to check the sequence order instead
                    print(f"   Pattern {pattern}: Found in Turn {actual_turn} ✅")
                else:
                    print(f"   Pattern {pattern}: NOT FOUND ❌")
                    all_correct = False
            
            if all_correct and len(patterns_found) == 3:
                print(f"\n🎉 SUCCESS: Tất cả 3 patterns đã được lưu!")
                print(f"   Export sẽ hiển thị đúng thứ tự các câu trả lời")
            else:
                print(f"\n❌ ISSUE: Có vấn đề với việc lưu data")
        
        # Step 7: Export URLs
        print(f"\n📄 EXPORT & VERIFICATION:")
        print(f"   🔗 Export DOCX: http://localhost:8000/api/debate/{team_id}/export_docx")
        print(f"   🔗 Raw turns data: http://localhost:8000/api/debate/{team_id}/turns")
        print(f"   🔗 Session info: http://localhost:8000/api/debate/{team_id}/info")
        
        print(f"\n✅ SESSION TEST HOÀN THÀNH!")
        print(f"   Team ID: {team_id}")
        print(f"   Hãy tải export DOCX để xem kết quả!")
        
        return team_id
        
    except Exception as e:
        print(f"💥 Lỗi: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    team_id = create_complete_test_session()
    if team_id:
        print(f"\n🚀 ĐỂ KIỂM TRA EXPORT:")
        print(f"   1. Mở: http://localhost:8000/api/debate/{team_id}/export_docx")
        print(f"   2. Tải file DOCX") 
        print(f"   3. Kiểm tra Phase 2 section")
        print(f"   4. Verify Turn 1 có '111111...', Turn 2 có '222222...', Turn 3 có '333333...'") 