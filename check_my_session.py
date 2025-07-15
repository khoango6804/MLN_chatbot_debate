#!/usr/bin/env python3

import requests
import json

def check_user_session():
    """Kiểm tra session cụ thể của người dùng"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 KIỂM TRA SESSION CỦA BẠN")
    print("=" * 50)
    
    # Lấy danh sách các session active
    response = requests.get(f"{base_url}/api/admin/sessions")
    if response.status_code != 200:
        print("❌ Không thể kết nối backend")
        return
    
    data = response.json()
    active_sessions = data.get('active', [])
    
    print(f"📋 Có {len(active_sessions)} session đang hoạt động:")
    print()
    
    for i, session in enumerate(active_sessions, 1):
        team_id = session['team_id']
        current_phase = session['current_phase']
        members = session.get('members', [])
        
        print(f"{i}. Team ID: {team_id}")
        print(f"   Phase: {current_phase}")
        print(f"   Members: {', '.join(members)}")
        
        # Kiểm tra Phase 2 data
        try:
            turns_response = requests.get(f"{base_url}/api/debate/{team_id}/turns")
            if turns_response.status_code == 200:
                turns_data = turns_response.json()
                phase2_turns = turns_data.get('phase2_turns', [])
                
                # Tìm student answers
                student_answers = [t for t in phase2_turns if t.get('asker') == 'student' and t.get('answer')]
                
                print(f"   Student answers: {len(student_answers)}")
                for j, turn in enumerate(student_answers, 1):
                    answer = turn.get('answer', '')
                    print(f"      Answer {j}: {answer[:60]}...")
                
                # Kiểm tra pattern 111111
                has_111 = any('111111' in turn.get('answer', '') for turn in student_answers)
                print(f"   🔍 Có pattern '111111': {'✅ CÓ' if has_111 else '❌ KHÔNG'}")
            else:
                print(f"   ❌ Không thể lấy dữ liệu turns")
        except Exception as e:
            print(f"   ❌ Lỗi: {e}")
        
        print()
    
    print("💡 HƯỚNG DẪN:")
    print("1. Nếu bạn thấy session của mình và có '✅ CÓ' pattern '111111' - dữ liệu ĐÃ được lưu!")
    print("2. Nếu không thấy - hãy kiểm tra lại Team ID hoặc làm mới trang web")
    print("3. Nếu vẫn không thấy - có thể là vấn đề cache browser")

if __name__ == "__main__":
    check_user_session() 