#!/usr/bin/env python3

import requests
import json
import random
from datetime import datetime

class SessionChecker:
    def __init__(self):
        self.base_url = "http://localhost:8000/api"
        
    def check_current_sessions(self):
        """Kiểm tra tất cả session hiện tại"""
        print("=" * 60)
        print("🔍 KIỂM TRA CÁC SESSION HIỆN TẠI")
        print("=" * 60)
        
        try:
            response = requests.get(f"{self.base_url}/admin/sessions")
            if response.status_code != 200:
                print(f"❌ Không thể lấy danh sách session: {response.status_code}")
                return None
                
            data = response.json()
            active_sessions = data.get("active", [])
            completed_sessions = data.get("completed", [])
            
            print(f"📊 Tổng quan:")
            print(f"   - Active sessions: {len(active_sessions)}")
            print(f"   - Completed sessions: {len(completed_sessions)}")
            
            # Hiển thị active sessions
            if active_sessions:
                print(f"\n🔴 ACTIVE SESSIONS:")
                for i, session in enumerate(active_sessions, 1):
                    team_id = session.get("team_id", "Unknown")
                    topic = session.get("topic", "Unknown")[:50]
                    phase = session.get("current_phase", "Unknown")
                    members = session.get("members", [])
                    
                    print(f"   {i}. {team_id}")
                    print(f"      Topic: {topic}...")
                    print(f"      Phase: {phase}")
                    print(f"      Members: {', '.join(members)}")
                    print()
                    
                return active_sessions
            else:
                print("\n✅ Không có active session nào")
                
            # Hiển thị vài completed sessions gần nhất
            if completed_sessions:
                print(f"\n🟢 COMPLETED SESSIONS (5 gần nhất):")
                for i, session in enumerate(completed_sessions[:5], 1):
                    team_id = session.get("team_id", "Unknown")
                    completed_at = session.get("completed_at", "Unknown")
                    status = session.get("status", "Unknown")
                    
                    print(f"   {i}. {team_id} - {status} - {completed_at}")
                    
            return None
            
        except Exception as e:
            print(f"❌ Lỗi khi kiểm tra sessions: {e}")
            return None
    
    def inspect_session(self, team_id):
        """Kiểm tra chi tiết một session"""
        print("=" * 60)
        print(f"🔬 KIỂM TRA CHI TIẾT SESSION: {team_id}")
        print("=" * 60)
        
        try:
            # Get session info
            info_response = requests.get(f"{self.base_url}/debate/{team_id}/info")
            if info_response.status_code != 200:
                print(f"❌ Không thể lấy thông tin session: {info_response.status_code}")
                return False
                
            info_data = info_response.json()
            
            print(f"📋 Thông tin cơ bản:")
            print(f"   Team ID: {info_data.get('team_id', 'N/A')}")
            print(f"   Topic: {info_data.get('topic', 'N/A')}")
            print(f"   Members: {', '.join(info_data.get('members', []))}")
            print(f"   Phase: {info_data.get('current_phase', 'N/A')}")
            print(f"   Course: {info_data.get('course_code', 'N/A')}")
            print(f"   Status: {info_data.get('status', 'N/A')}")
            
            # Check if this session has Phase 2 data
            print(f"\n🔍 Kiểm tra dữ liệu Phase 2:")
            
            # Try to export and see what's in it
            export_response = requests.get(f"{self.base_url}/debate/{team_id}/export_docx")
            print(f"   Export status: {export_response.status_code}")
            
            if export_response.status_code == 200:
                print(f"   ✅ Export thành công - session có thể được xuất")
            else:
                print(f"   ❌ Export thất bại")
                
            return True
            
        except Exception as e:
            print(f"❌ Lỗi khi kiểm tra session {team_id}: {e}")
            return False
    
    def create_test_session(self):
        """Tạo session mới để test Phase 2 fix"""
        print("=" * 60)
        print("🆕 TẠO SESSION MỚI ĐỂ TEST PHASE 2 FIX")
        print("=" * 60)
        
        # Generate unique team ID
        timestamp = datetime.now().strftime("%H%M%S")
        team_id = f"phase2_test_{timestamp}"
        
        try:
            # 1. Create session
            print("1. Tạo session...")
            create_response = requests.post(f"{self.base_url}/debate/start", json={
                "team_id": team_id,
                "members": ["Tester Phase 2", "Debug User"],
                "course_code": "MLN111"
            })
            
            if create_response.status_code != 200:
                print(f"❌ Tạo session thất bại: {create_response.text}")
                return None
                
            print(f"✅ Tạo session thành công: {team_id}")
            
            # 2. Set stance
            print("2. Thiết lập lập trường...")
            stance_response = requests.post(f"{self.base_url}/debate/{team_id}/stance", json={
                "stance": "ĐỒNG TÌNH"
            })
            print(f"   Stance response: {stance_response.status_code}")
            
            # 3. Submit arguments
            print("3. Gửi luận điểm Phase 1...")
            args_response = requests.post(f"{self.base_url}/debate/{team_id}/arguments", json={
                "arguments": [
                    "Luận điểm test số 1 về chủ đề này",
                    "Luận điểm test số 2 với nhiều chi tiết hơn"
                ]
            })
            print(f"   Arguments response: {args_response.status_code}")
            
            # 4. Get Phase 2 questions
            print("4. Lấy câu hỏi Phase 2...")
            phase2_response = requests.post(f"{self.base_url}/debate/{team_id}/phase2", json={
                "team_arguments": [
                    "Luận điểm test số 1 về chủ đề này",
                    "Luận điểm test số 2 với nhiều chi tiết hơn"
                ]
            })
            
            if phase2_response.status_code != 200:
                print(f"❌ Lấy câu hỏi Phase 2 thất bại: {phase2_response.text}")
                return None
                
            questions_data = phase2_response.json()
            ai_questions = questions_data.get("data", {}).get("ai_questions", [])
            print(f"✅ Nhận được {len(ai_questions)} câu hỏi AI")
            
            # 5. Test Phase 2 with problematic patterns
            print("\n5. Test Phase 2 với các pattern có vấn đề...")
            test_answers = [
                "1111111111111111111111111111111 đây là câu trả lời đầu tiên của tôi về vấn đề này",
                "2222222222222222222222222222222 đây là câu trả lời thứ hai với nhiều chi tiết hơn",
                "3333333333333333333333333333333 đây là câu trả lời thứ ba kết luận về vấn đề"
            ]
            
            successful_answers = 0
            
            for i, answer in enumerate(test_answers):
                if i < len(ai_questions):
                    question = ai_questions[i]
                    print(f"\n   Test answer {i+1}: {answer[:40]}...")
                    
                    turn_response = requests.post(f"{self.base_url}/debate/{team_id}/ai-question/turn", json={
                        "asker": "student",
                        "question": question,
                        "answer": answer
                    })
                    
                    if turn_response.status_code == 200:
                        turn_data = turn_response.json()
                        turns = turn_data.get("turns", [])
                        print(f"   ✅ Lưu thành công. Total turns: {len(turns)}")
                        successful_answers += 1
                        
                        # Check if our specific answer is saved
                        for turn in turns:
                            if turn.get("asker") == "student" and turn.get("answer"):
                                answer_text = turn.get("answer", "")
                                if f"{i+1}{i+1}{i+1}{i+1}" in answer_text:  # Check for 1111, 2222, 3333
                                    print(f"   ✅ Tìm thấy answer với pattern: {answer_text[:50]}...")
                    else:
                        print(f"   ❌ Lưu thất bại: {turn_response.text}")
            
            print(f"\n📊 Kết quả test:")
            print(f"   - Số câu trả lời test: {len(test_answers)}")
            print(f"   - Số câu trả lời lưu thành công: {successful_answers}")
            
            # 6. Final verification
            print("\n6. Kiểm tra cuối cùng...")
            final_info = requests.get(f"{self.base_url}/debate/{team_id}/info")
            if final_info.status_code == 200:
                info_data = final_info.json()
                print(f"   ✅ Session vẫn hoạt động: {info_data.get('current_phase', 'Unknown')}")
                
            # 7. Test export
            print("7. Test export...")
            export_response = requests.get(f"{self.base_url}/debate/{team_id}/export_docx")
            print(f"   Export status: {export_response.status_code}")
            
            return team_id
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo test session: {e}")
            return None

def main():
    checker = SessionChecker()
    
    print("🎯 MLN DEBATE SESSION CHECKER & TESTER")
    print("Công cụ kiểm tra session hiện tại và test Phase 2 fix")
    print()
    
    # 1. Check current sessions
    active_sessions = checker.check_current_sessions()
    
    # 2. If there are active sessions, offer to inspect them
    if active_sessions:
        print("\n" + "="*60)
        print("💡 TÙY CHỌN KIỂM TRA SESSION HIỆN TẠI")
        print("="*60)
        
        for i, session in enumerate(active_sessions, 1):
            team_id = session.get("team_id", "Unknown")
            print(f"{i}. Kiểm tra session: {team_id}")
            
        print("0. Bỏ qua, chỉ tạo session mới")
        
        try:
            choice = input("\nNhập số để chọn session cần kiểm tra (hoặc 0 để bỏ qua): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(active_sessions):
                selected_session = active_sessions[int(choice) - 1]
                team_id = selected_session.get("team_id")
                checker.inspect_session(team_id)
        except:
            print("Bỏ qua kiểm tra session hiện tại...")
    
    # 3. Always offer to create new test session
    print("\n" + "="*60)
    print("💡 TÙY CHỌN TẠO SESSION MỚI")
    print("="*60)
    
    try:
        create_new = input("Bạn có muốn tạo session mới để test Phase 2 fix? (y/n): ").strip().lower()
        if create_new in ['y', 'yes', 'có']:
            test_team_id = checker.create_test_session()
            if test_team_id:
                print(f"\n🎉 Hoàn thành! Session test: {test_team_id}")
                print("✅ Bạn có thể sử dụng session này để test Phase 2")
    except:
        print("Bỏ qua tạo session mới...")
    
    print("\n🏁 Hoàn thành kiểm tra!")

if __name__ == "__main__":
    main() 