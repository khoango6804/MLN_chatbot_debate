#!/usr/bin/env python3
"""
Script kiểm tra toàn diện trạng thái hệ thống MLN Debate
Kiểm tra:
1. Backend có đang chạy không
2. Session hiện tại trong memory
3. Tạo session test mới và kiểm tra export
4. Xác minh logic Phase 2 và Phase 3
"""

import requests
import json
import time
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = f"CHECK_SYSTEM_{int(time.time())}"

def check_backend_status():
    """Kiểm tra backend có đang chạy không"""
    print("=" * 60)
    print("1. KIỂM TRA BACKEND STATUS")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend đang chạy bình thường")
            return True
        else:
            print(f"❌ Backend có vấn đề - Status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Không thể kết nối tới backend: {e}")
        return False

def check_active_sessions():
    """Kiểm tra các session đang active"""
    print("\n" + "=" * 60)
    print("2. KIỂM TRA ACTIVE SESSIONS")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/debug/sessions")
        if response.status_code == 200:
            sessions = response.json()
            print(f"✅ Có {len(sessions)} session(s) đang active:")
            for session_id, info in sessions.items():
                print(f"  - {session_id}: {info.get('turns', 0)} turns, Phase {info.get('phase', 'Unknown')}")
            return sessions
        else:
            print(f"❌ Không thể lấy thông tin sessions - Status: {response.status_code}")
            return {}
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra sessions: {e}")
        return {}

def create_test_session():
    """Tạo session test mới"""
    print("\n" + "=" * 60)
    print("3. TẠO SESSION TEST MỚI")
    print("=" * 60)
    
    try:
        # Tạo session mới
        response = requests.post(f"{BASE_URL}/api/session", json={
            "team_id": TEST_TEAM_ID,
            "student_name": "Test Student",
            "topic": "Test Topic - Kiểm tra hệ thống"
        })
        
        if response.status_code == 200:
            print(f"✅ Tạo session mới thành công: {TEST_TEAM_ID}")
            return True
        else:
            print(f"❌ Không thể tạo session - Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Lỗi khi tạo session: {e}")
        return False

def test_phase2_flow():
    """Test Phase 2 flow hoàn chỉnh"""
    print("\n" + "=" * 60)
    print("4. TEST PHASE 2 FLOW")
    print("=" * 60)
    
    answers = [
        "ANSWER_1_111111111 - Đây là câu trả lời đầu tiên để test",
        "ANSWER_2_222222222 - Đây là câu trả lời thứ hai để test", 
        "ANSWER_3_333333333 - Đây là câu trả lời thứ ba để test"
    ]
    
    try:
        # Bắt đầu Phase 2
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/start-phase2")
        if response.status_code != 200:
            print(f"❌ Không thể bắt đầu Phase 2 - Status: {response.status_code}")
            return False
        
        print("✅ Bắt đầu Phase 2 thành công")
        
        # Trả lời 3 câu hỏi AI
        for i, answer in enumerate(answers, 1):
            print(f"\n--- Trả lời câu hỏi {i} ---")
            
            response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question-turn", 
                                   json={"answer": answer})
            
            if response.status_code == 200:
                print(f"✅ Trả lời câu {i} thành công")
                result = response.json()
                print(f"  Turn count sau khi trả lời: {result.get('turn_count', 'Unknown')}")
            else:
                print(f"❌ Lỗi khi trả lời câu {i} - Status: {response.status_code}")
                return False
                
            # Tạo câu hỏi tiếp theo (trừ câu cuối)
            if i < len(answers):
                response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/generate")
                if response.status_code == 200:
                    print(f"✅ Tạo câu hỏi {i+1} thành công")
                else:
                    print(f"❌ Lỗi khi tạo câu hỏi {i+1}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi trong Phase 2 flow: {e}")
        return False

def test_phase3_flow():
    """Test Phase 3 flow"""
    print("\n" + "=" * 60)
    print("5. TEST PHASE 3 FLOW")
    print("=" * 60)
    
    try:
        # Bắt đầu Phase 3
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/start-phase3")
        if response.status_code != 200:
            print(f"❌ Không thể bắt đầu Phase 3 - Status: {response.status_code}")
            return False
            
        print("✅ Bắt đầu Phase 3 thành công")
        
        # Thêm một vài turns cho Phase 3
        phase3_data = [
            {"role": "student", "content": "STUDENT_PHASE3_111 - Student answer in phase 3"},
            {"role": "ai", "content": "AI_PHASE3_222 - AI response in phase 3"},
            {"role": "student", "content": "STUDENT_PHASE3_333 - Final student response"}
        ]
        
        for turn_data in phase3_data:
            response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/add-turn", 
                                   json=turn_data)
            if response.status_code == 200:
                print(f"✅ Thêm turn Phase 3 thành công: {turn_data['role']}")
            else:
                print(f"❌ Lỗi khi thêm turn Phase 3: {turn_data['role']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi trong Phase 3 flow: {e}")
        return False

def test_export_function():
    """Test export function"""
    print("\n" + "=" * 60)
    print("6. TEST EXPORT FUNCTION")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/export")
        if response.status_code == 200:
            print("✅ Export thành công - Đang phân tích nội dung...")
            
            # Lưu file export
            filename = f"export_check_{TEST_TEAM_ID}.docx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✅ Đã lưu file export: {filename}")
            
            # Kiểm tra header để xác nhận là file Word
            if response.headers.get('content-type') == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                print("✅ File export có định dạng DOCX đúng")
            else:
                print("⚠️  File export có thể không đúng định dạng DOCX")
                
            return True
        else:
            print(f"❌ Export thất bại - Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi export: {e}")
        return False

def check_session_data_structure():
    """Kiểm tra cấu trúc dữ liệu session"""
    print("\n" + "=" * 60)
    print("7. KIỂM TRA CẤU TRÚC DỮ LIỆU SESSION")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/debug/session/{TEST_TEAM_ID}")
        if response.status_code == 200:
            session_data = response.json()
            print("✅ Lấy thông tin session thành công")
            
            # Kiểm tra Phase 2 data
            phase2_turns = session_data.get('turns', [])
            print(f"\n📊 PHASE 2 DATA ({len(phase2_turns)} turns):")
            for i, turn in enumerate(phase2_turns):
                role = turn.get('role', 'Unknown')
                content_preview = turn.get('content', '')[:50] + "..." if len(turn.get('content', '')) > 50 else turn.get('content', '')
                print(f"  Turn {i+1}: {role} - {content_preview}")
            
            # Kiểm tra Phase 3 data
            phase3_turns = session_data.get('phase3_turns', [])
            print(f"\n📊 PHASE 3 DATA ({len(phase3_turns)} turns):")
            for i, turn in enumerate(phase3_turns):
                role = turn.get('role', 'Unknown')
                content_preview = turn.get('content', '')[:50] + "..." if len(turn.get('content', '')) > 50 else turn.get('content', '')
                print(f"  Turn {i+1}: {role} - {content_preview}")
            
            # Kiểm tra các pattern test
            print("\n🔍 TÌM KIẾM CÁC PATTERN TEST:")
            all_content = ""
            for turn in phase2_turns + phase3_turns:
                all_content += turn.get('content', '') + " "
            
            patterns = ["111111", "222222", "333333"]
            for pattern in patterns:
                if pattern in all_content:
                    print(f"  ✅ Tìm thấy pattern {pattern}")
                else:
                    print(f"  ❌ Không tìm thấy pattern {pattern}")
            
            return True
        else:
            print(f"❌ Không thể lấy thông tin session - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra session data: {e}")
        return False

def cleanup_test_session():
    """Dọn dẹp session test"""
    print("\n" + "=" * 60)
    print("8. DỌN DẸP SESSION TEST")
    print("=" * 60)
    
    try:
        response = requests.delete(f"{BASE_URL}/api/debug/session/{TEST_TEAM_ID}")
        if response.status_code == 200:
            print("✅ Đã xóa session test thành công")
        else:
            print(f"⚠️  Không thể xóa session test - Status: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Lỗi khi xóa session test: {e}")

def main():
    """Chạy tất cả các kiểm tra"""
    print("🚀 BẮT ĐẦU KIỂM TRA HỆ THỐNG MLN DEBATE")
    print(f"Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Test Session ID: {TEST_TEAM_ID}")
    
    # Danh sách các bước kiểm tra
    checks = [
        ("Backend Status", check_backend_status),
        ("Active Sessions", check_active_sessions),
        ("Create Test Session", create_test_session),
        ("Phase 2 Flow", test_phase2_flow),
        ("Phase 3 Flow", test_phase3_flow),
        ("Export Function", test_export_function),
        ("Session Data Structure", check_session_data_structure)
    ]
    
    results = {}
    
    # Chạy từng bước kiểm tra
    for check_name, check_func in checks:
        try:
            result = check_func()
            results[check_name] = result
        except Exception as e:
            print(f"❌ Lỗi nghiêm trọng trong {check_name}: {e}")
            results[check_name] = False
    
    # Dọn dẹp
    cleanup_test_session()
    
    # Tổng kết
    print("\n" + "=" * 60)
    print("📋 TỔNG KẾT KẾT QUẢ KIỂM TRA")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for check_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:10} {check_name}")
        if result:
            passed += 1
    
    print(f"\n📊 Tổng kết: {passed}/{total} kiểm tra thành công")
    
    if passed == total:
        print("🎉 TẤT CẢ KIỂM TRA ĐỀU THÀNH CÔNG! Hệ thống hoạt động bình thường.")
    else:
        print("⚠️  CÓ MỘT SỐ VẤN ĐỀ CẦN ĐƯỢC KHẮC PHỤC!")
        print("\n💡 Khuyến nghị:")
        if not results.get("Backend Status"):
            print("- Kiểm tra và khởi động lại backend")
        if not results.get("Export Function"):
            print("- Kiểm tra logic export function trong backend/main.py")
        if not results.get("Phase 2 Flow") or not results.get("Phase 3 Flow"):
            print("- Kiểm tra logic Phase 2/3 trong backend")

if __name__ == "__main__":
    main() 