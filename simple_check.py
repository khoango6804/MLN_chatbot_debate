#!/usr/bin/env python3
"""
Script kiểm tra đơn giản cho hệ thống MLN Debate
Chỉ test các endpoints thực sự có sẵn
"""

import requests
import json
import time
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = f"SIMPLE_CHECK_{int(time.time())}"

def test_health():
    print("=" * 50)
    print("1. KIỂM TRA HEALTH ENDPOINT")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend khỏe mạnh!")
            print(f"   Status: {data.get('status')}")
            print(f"   Debate System Available: {data.get('debate_system_available')}")
            return True
        else:
            print(f"❌ Có vấn đề - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_create_session():
    print("\n" + "=" * 50)
    print("2. TẠO SESSION MỚI")
    print("=" * 50)
    
    try:
        payload = {
            "course_code": "TEST_COURSE",
            "members": ["Test Student 1", "Test Student 2"],
            "team_id": TEST_TEAM_ID
        }
        
        response = requests.post(f"{BASE_URL}/api/debate/start", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Tạo session thành công!")
            print(f"   Team ID: {data.get('team_id')}")
            print(f"   Topic: {data.get('topic', '')[:100]}...")
            print(f"   Stance: {data.get('stance')}")
            return True
        else:
            print(f"❌ Không thể tạo session - Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_get_session_info():
    print("\n" + "=" * 50)
    print("3. KIỂM TRA THÔNG TIN SESSION")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/info", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Lấy thông tin session thành công!")
            print(f"   Team ID: {data.get('team_id')}")
            print(f"   Topic: {data.get('topic', '')[:100]}...")
            print(f"   Members: {data.get('members')}")
            print(f"   Current Phase: {data.get('current_phase')}")
            print(f"   Stance: {data.get('stance')}")
            return True
        else:
            print(f"❌ Không thể lấy thông tin - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_phase1():
    print("\n" + "=" * 50)
    print("4. TEST PHASE 1")
    print("=" * 50)
    
    try:
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase1", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Phase 1 thành công!")
            ai_args = data.get('data', {}).get('ai_arguments', [])
            print(f"   AI đã tạo {len(ai_args)} arguments:")
            for i, arg in enumerate(ai_args[:3], 1):  # Show first 3
                print(f"     {i}. {arg[:80]}...")
            return True
        else:
            print(f"❌ Phase 1 thất bại - Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_phase2_start():
    print("\n" + "=" * 50)
    print("5. TEST PHASE 2 START")
    print("=" * 50)
    
    try:
        # Submit team arguments first
        team_args = [
            "TEST_ARG_111111 - Đây là luận điểm thứ nhất của team để test",
            "TEST_ARG_222222 - Đây là luận điểm thứ hai của team để test",
            "TEST_ARG_333333 - Đây là luận điểm thứ ba của team để test"
        ]
        
        payload = {"team_arguments": team_args}
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2", json=payload, timeout=10)
        print(f"Submit arguments - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Gửi arguments thành công!")
            ai_questions = data.get('data', {}).get('ai_questions', [])
            print(f"   AI đã tạo {len(ai_questions)} questions:")
            for i, q in enumerate(ai_questions[:3], 1):
                print(f"     {i}. {q[:80]}...")
            
            # Now start Phase 2
            response2 = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2/start", timeout=5)
            print(f"Start Phase 2 - Status Code: {response2.status_code}")
            
            if response2.status_code == 200:
                print(f"✅ Phase 2 đã bắt đầu!")
                return True
            else:
                print(f"❌ Không thể start Phase 2 - Status: {response2.status_code}")
                return False
        else:
            print(f"❌ Không thể submit arguments - Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def test_phase2_qa():
    print("\n" + "=" * 50)
    print("6. TEST PHASE 2 Q&A")
    print("=" * 50)
    
    test_answers = [
        "ANSWER_TEST_111111 - Đây là câu trả lời đầu tiên trong Phase 2",
        "ANSWER_TEST_222222 - Đây là câu trả lời thứ hai trong Phase 2",
        "ANSWER_TEST_333333 - Đây là câu trả lời thứ ba trong Phase 2"
    ]
    
    try:
        for i, answer in enumerate(test_answers, 1):
            print(f"\n--- Trả lời câu hỏi {i} ---")
            
            # Answer AI question
            payload = {
                "answer": answer,
                "asker": "ai", 
                "question": f"Test question {i}"
            }
            response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/turn", 
                                   json=payload, timeout=10)
            print(f"Answer question {i} - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Trả lời thành công!")
                turns = data.get('turns', [])
                print(f"   Total turns hiện tại: {len(turns)}")
            else:
                print(f"   ❌ Lỗi khi trả lời - Status: {response.status_code}")
                return False
            
            # Generate next question (except for last one)
            if i < len(test_answers):
                response2 = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/generate", 
                                        timeout=10)
                print(f"Generate next question - Status: {response2.status_code}")
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    new_q = data2.get('new_question', '')
                    print(f"   ✅ Tạo câu hỏi mới: {new_q[:60]}...")
                else:
                    print(f"   ❌ Lỗi tạo câu hỏi mới - Status: {response2.status_code}")
        
        print(f"\n✅ Hoàn thành Phase 2 Q&A với {len(test_answers)} câu hỏi!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi trong Phase 2 Q&A: {e}")
        return False

def test_export():
    print("\n" + "=" * 50)
    print("7. TEST EXPORT FUNCTION")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/export", timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            # Save export file
            filename = f"export_simple_check_{TEST_TEAM_ID}.docx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Export thành công!")
            print(f"   File saved: {filename}")
            print(f"   File size: {len(response.content)} bytes")
            
            # Check content type
            content_type = response.headers.get('content-type', '')
            if 'application/vnd.openxmlformats' in content_type:
                print(f"   ✅ Content type đúng: DOCX")
            else:
                print(f"   ⚠️  Content type: {content_type}")
            
            return True
        else:
            print(f"❌ Export thất bại - Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def main():
    print("🚀 BẮT ĐẦU KIỂM TRA ĐƠN GIẢN MLN DEBATE SYSTEM")
    print(f"Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Test Team ID: {TEST_TEAM_ID}")
    
    tests = [
        ("Health Check", test_health),
        ("Create Session", test_create_session),
        ("Get Session Info", test_get_session_info),
        ("Phase 1", test_phase1),
        ("Phase 2 Start", test_phase2_start),
        ("Phase 2 Q&A", test_phase2_qa),
        ("Export Function", test_export)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ Lỗi nghiêm trọng trong {test_name}: {e}")
            results[test_name] = False
    
    # Tổng kết
    print("\n" + "=" * 60)
    print("📋 TỔNG KẾT")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:10} {test_name}")
    
    print(f"\n📊 Kết quả: {passed}/{total} tests thành công")
    
    if passed == total:
        print("🎉 TẤT CẢ TESTS ĐỀU THÀNH CÔNG!")
        print("🔥 HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG!")
    else:
        print("⚠️  CÓ MỘT SỐ TESTS THẤT BẠI")
        print("\n💡 Khuyến nghị kiểm tra:")
        if not results.get("Health Check"):
            print("- Backend có thể chưa khởi động hoặc có lỗi")
        if not results.get("Export Function"):
            print("- Export function có thể có vấn đề data mixing")
        if not results.get("Phase 2 Q&A"):
            print("- Phase 2 logic có thể có vấn đề")

if __name__ == "__main__":
    main() 