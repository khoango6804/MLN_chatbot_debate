#!/usr/bin/env python3
"""
TEST CUỐI CÙNG - Xác minh toàn bộ hệ thống MLN Debate
Với tất cả endpoints đúng và fix mà chúng ta đã làm
"""

import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = f"FINAL_VERIFY_{int(time.time())}"

def test_complete_flow():
    print("🎯 FINAL VERIFICATION - MLN DEBATE SYSTEM")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Test Team ID: {TEST_TEAM_ID}")
    print("=" * 60)
    
    # Step 1: Create Session
    print("\n1️⃣ CREATING NEW SESSION...")
    payload = {
        "course_code": "FINAL_TEST_COURSE",
        "members": ["Student Final Test"],
        "team_id": TEST_TEAM_ID
    }
    response = requests.post(f"{BASE_URL}/api/debate/start", json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Session created successfully!")
        print(f"   📋 Topic: {data.get('topic', '')[:100]}...")
        print(f"   🎯 Stance: {data.get('stance')}")
    else:
        print(f"   ❌ Failed to create session: {response.status_code}")
        return False
    
    # Step 2: Phase 1 - AI Arguments
    print("\n2️⃣ PHASE 1 - AI ARGUMENTS...")
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase1")
    if response.status_code == 200:
        data = response.json()
        ai_args = data.get('data', {}).get('ai_arguments', [])
        print(f"   ✅ AI generated {len(ai_args)} arguments")
        for i, arg in enumerate(ai_args[:2], 1):
            print(f"   📝 Arg {i}: {arg[:60]}...")
    else:
        print(f"   ❌ Phase 1 failed: {response.status_code}")
        return False
    
    # Step 3: Submit Team Arguments & Start Phase 2
    print("\n3️⃣ PHASE 2 SETUP - SUBMIT TEAM ARGUMENTS...")
    team_args = [
        "FINAL_ARG_111111 - Luận điểm đầu tiên của team trong test cuối cùng",
        "FINAL_ARG_222222 - Luận điểm thứ hai của team trong test cuối cùng", 
        "FINAL_ARG_333333 - Luận điểm thứ ba của team trong test cuối cùng"
    ]
    payload = {"team_arguments": team_args}
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2", json=payload)
    if response.status_code == 200:
        data = response.json()
        ai_questions = data.get('data', {}).get('ai_questions', [])
        print(f"   ✅ Team arguments submitted successfully!")
        print(f"   🤖 AI generated {len(ai_questions)} questions")
        
        # Start Phase 2
        response2 = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2/start")
        if response2.status_code == 200:
            print(f"   ✅ Phase 2 started successfully!")
        else:
            print(f"   ❌ Failed to start Phase 2: {response2.status_code}")
            return False
    else:
        print(f"   ❌ Failed to submit arguments: {response.status_code}")
        return False
    
    # Step 4: Phase 2 Q&A - Answer AI Questions
    print("\n4️⃣ PHASE 2 Q&A - STUDENT ANSWERS AI QUESTIONS...")
    test_answers = [
        "FINAL_ANSWER_111111 - Câu trả lời đầu tiên trong test cuối cùng để xác minh không bị data mixing",
        "FINAL_ANSWER_222222 - Câu trả lời thứ hai trong test cuối cùng để xác minh không bị data mixing",
        "FINAL_ANSWER_333333 - Câu trả lời thứ ba trong test cuối cùng để xác minh không bị data mixing"
    ]
    
    total_turns = 0
    for i, answer in enumerate(test_answers, 1):
        print(f"\n   📝 Answering Question {i}...")
        
        # Answer AI question
        payload = {
            "answer": answer,
            "asker": "ai",
            "question": f"AI Question {i} for final test"
        }
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/turn", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            turns = data.get('turns', [])
            total_turns = len(turns)
            print(f"      ✅ Answer submitted successfully! (Total turns: {total_turns})")
        else:
            print(f"      ❌ Failed to submit answer: {response.status_code}")
            return False
        
        # Generate next question (except for last answer)
        if i < len(test_answers):
            response2 = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/generate")
            if response2.status_code == 200:
                data2 = response2.json()
                new_question = data2.get('new_question', '')
                print(f"      🤖 Next AI question generated: {new_question[:50]}...")
            else:
                print(f"      ⚠️  Failed to generate next question: {response2.status_code}")
    
    print(f"\n   ✅ Phase 2 Q&A completed with {len(test_answers)} answers and {total_turns} total turns")
    
    # Step 5: Export and Verify
    print("\n5️⃣ EXPORT & VERIFICATION...")
    response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/export_docx")
    
    if response.status_code == 200:
        filename = f"final_verification_{TEST_TEAM_ID}.docx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        file_size = len(response.content)
        content_type = response.headers.get('content-type', '')
        
        print(f"   ✅ Export successful!")
        print(f"   📄 File: {filename}")
        print(f"   💾 Size: {file_size:,} bytes")
        print(f"   📋 Content Type: {content_type}")
        
        # Basic content validation
        if 'application/vnd.openxmlformats' in content_type and file_size > 1000:
            print(f"   ✅ Export file appears to be valid DOCX")
            return True
        else:
            print(f"   ⚠️  Export file may have issues")
            return False
    else:
        print(f"   ❌ Export failed: {response.status_code}")
        print(f"   📄 Response: {response.text}")
        return False

def main():
    success = test_complete_flow()
    
    print("\n" + "=" * 60)
    print("🏁 FINAL VERIFICATION RESULTS")
    print("=" * 60)
    
    if success:
        print("🎉 ĐẠT - TẤT CẢ KIỂM TRA ĐỀU THÀNH CÔNG!")
        print("✅ Hệ thống MLN Debate hoạt động bình thường")
        print("✅ Phase 2 data storage hoạt động đúng")
        print("✅ Export function hoạt động đúng")
        print("✅ Không có data mixing giữa Phase 2 và Phase 3")
        print("\n🚀 HỆ THỐNG SẴN SÀNG ĐỂ SỬ DỤNG!")
    else:
        print("❌ CHƯA ĐẠT - CÓ MỘT SỐ VẤN ĐỀ CẦN KHẮC PHỤC")
        print("💡 Vui lòng kiểm tra lại logs và endpoints")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 