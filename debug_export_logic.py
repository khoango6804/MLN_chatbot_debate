#!/usr/bin/env python3
"""
Debug chi tiết export logic để tìm ra tại sao dữ liệu bị đảo ngược
"""

import requests
import time

def debug_export_logic():
    """Debug chi tiết export function"""
    
    base_url = "http://localhost:8000/api"
    team_id = f"DEBUG_EXPORT_{int(time.time())}"
    
    print("🔧 DEBUG EXPORT LOGIC DETAILED")
    print("=" * 60)
    
    try:
        # Tạo session mới đơn giản
        print("📝 Creating simple test session...")
        
        # Step 1: Create session
        start_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Debug User"],
            "course_code": "TEST"
        })
        
        if start_response.status_code != 200:
            print(f"❌ Failed to create session: {start_response.text}")
            return
        
        print(f"✅ Session created: {team_id}")
        
        # Step 2: Submit simple arguments
        args_response = requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "team_id": team_id,
            "arguments": ["Simple argument 1", "Simple argument 2"]
        })
        
        if args_response.status_code != 200:
            print(f"❌ Failed arguments: {args_response.text}")
            return
        
        # Step 3: Start Phase 2
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": ["Simple argument 1", "Simple argument 2"]
        })
        
        if phase2_response.status_code != 200:
            print(f"❌ Failed Phase 2: {phase2_response.text}")
            return
        
        print("✅ Phase 2 started")
        
        # Step 4: Submit ONE answer với pattern rõ ràng
        print("\n📝 Submitting ONE clear answer...")
        answer_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
            "answer": "SINGLE_ANSWER_111111 This is the only answer I'm submitting",
            "asker": "student",
            "question": "Test question"
        })
        
        if answer_response.status_code != 200:
            print(f"❌ Failed to submit answer: {answer_response.text}")
            return
        
        print("✅ Single answer submitted")
        
        # Step 5: Kiểm tra raw data
        print(f"\n🔍 Checking raw session data...")
        turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if turns_response.status_code == 200:
            turns_data = turns_response.json()
            phase2_turns = turns_data.get('phase2_turns', [])
            phase3_turns = turns_data.get('phase3_turns', [])
            
            print(f"📊 Raw data analysis:")
            print(f"   Phase 2 turns: {len(phase2_turns)}")
            print(f"   Phase 3 turns: {len(phase3_turns)}")
            
            print(f"\n📋 Phase 2 raw data:")
            for i, turn in enumerate(phase2_turns):
                asker = turn.get('asker', 'unknown')
                question = turn.get('question', '')
                answer = turn.get('answer', '')
                
                print(f"   Turn {i+1}: {asker}")
                print(f"      Question: '{question[:50]}...'")
                print(f"      Answer: '{answer[:50]}...'")
                
                if 'SINGLE_ANSWER_111111' in answer:
                    print(f"      ✅ FOUND target answer in Phase 2 Turn {i+1}")
            
            print(f"\n📋 Phase 3 raw data:")
            for i, turn in enumerate(phase3_turns):
                asker = turn.get('asker', 'unknown')
                question = turn.get('question', '')
                answer = turn.get('answer', '')
                
                print(f"   Turn {i+1}: {asker}")
                print(f"      Question: '{question[:50]}...'")
                print(f"      Answer: '{answer[:50]}...'")
                
                if 'SINGLE_ANSWER_111111' in (question + answer):
                    print(f"      ❌ ERROR: Target answer found in Phase 3! This is wrong!")
        
        # Step 6: Test export và so sánh
        print(f"\n📄 Testing export...")
        export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
        
        if export_response.status_code == 200:
            print(f"✅ Export generated successfully")
            print(f"📁 Download: http://localhost:8000/api/debate/{team_id}/export_docx")
            
            # Lưu file để check
            with open(f"debug_export_{team_id}.docx", "wb") as f:
                f.write(export_response.content)
                
            print(f"💾 Saved as: debug_export_{team_id}.docx")
        else:
            print(f"❌ Export failed: {export_response.text}")
        
        print(f"\n🎯 CONCLUSION:")
        print(f"   If the target answer appears in Phase 2 raw data but")
        print(f"   shows up wrong in export, then export function has bug.")
        print(f"   If it appears in Phase 3 raw data, then data storage has bug.")
        
        return team_id
        
    except Exception as e:
        print(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    team_id = debug_export_logic()
    if team_id:
        print(f"\n🔗 Links for manual verification:")
        print(f"   Raw data: http://localhost:8000/api/debate/{team_id}/turns")
        print(f"   Export: http://localhost:8000/api/debate/{team_id}/export_docx") 