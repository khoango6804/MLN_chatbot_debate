#!/usr/bin/env python3
"""
DEBUG: MISSING FIRST ANSWER IN PHASE 2
Reproducing the exact issue user reported:
- First answer "111111..." disappears from Phase 2 display
- Only "222222..." and "333333..." are shown
"""

import requests
import time
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = f"DEBUG_MISSING_FIRST_{int(time.time())}"

# Exact patterns like user reported
PHASE2_ANSWERS = [
    "111111111111111 asdf ádf - ĐÂY LÀ CÂU TRẢ LỜI ĐẦU TIÊN BỊ MẤT",
    "222222222222222 asdf ádf - ĐÂY LÀ CÂU TRẢ LỜI THỨ HAI HIỂN THỊ",
    "333333333333333 asdf ád - ĐÂY LÀ CÂU TRẢ LỜI THỨ BA HIỂN THỊ"
]

def setup_session():
    """Setup session for debugging"""
    print("🔧 SETTING UP DEBUG SESSION...")
    
    # 1. Create session
    payload = {
        "course_code": "DEBUG_MISSING_FIRST",
        "members": ["Debug User"],
        "team_id": TEST_TEAM_ID
    }
    response = requests.post(f"{BASE_URL}/api/debate/start", json=payload)
    if response.status_code != 200:
        print(f"❌ Failed to create session: {response.status_code}")
        return False
    print(f"✅ Session created: {TEST_TEAM_ID}")
    
    # 2. Phase 1
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase1")
    if response.status_code != 200:
        print(f"❌ Phase 1 failed: {response.status_code}")
        return False
    print("✅ Phase 1 completed")
    
    # 3. Submit team arguments
    team_args = [
        "Team argument 1 for debugging missing first answer",
        "Team argument 2 for debugging missing first answer", 
        "Team argument 3 for debugging missing first answer"
    ]
    payload = {"team_arguments": team_args}
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2", json=payload)
    if response.status_code != 200:
        print(f"❌ Failed to submit arguments: {response.status_code}")
        return False
    print("✅ Team arguments submitted")
    
    # 4. Start Phase 2
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2/start")
    if response.status_code != 200:
        print(f"❌ Failed to start Phase 2: {response.status_code}")
        return False
    print("✅ Phase 2 started")
    
    return True

def answer_questions_step_by_step():
    """Answer each question and debug turns after each step"""
    print("\n🔍 DEBUGGING EACH ANSWER STEP BY STEP...")
    
    for i, answer in enumerate(PHASE2_ANSWERS, 1):
        print(f"\n--- STEP {i}: ANSWERING WITH PATTERN {answer[:15]}... ---")
        
        # Submit answer
        payload = {
            "answer": answer,
            "asker": "ai",
            "question": f"AI Question {i}"
        }
        response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/turn", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            turns = data.get('turns', [])
            print(f"✅ Answer {i} submitted successfully")
            print(f"📊 Total turns after answer {i}: {len(turns)}")
            
            # DEBUG: Analyze each turn
            print(f"🔍 ANALYZING TURNS AFTER ANSWER {i}:")
            for idx, turn in enumerate(turns):
                asker = turn.get('asker', 'unknown')
                question = turn.get('question', '')[:50]
                answer_content = turn.get('answer', '') or ''
                answer_preview = answer_content[:50] if answer_content else 'None'
                
                print(f"   Turn {idx+1}: {asker} | Q: {question}... | A: {answer_preview}...")
                
                # Check if our specific patterns exist
                for j, pattern in enumerate(["111111", "222222", "333333"], 1):
                    if pattern in answer_content:
                        print(f"      🎯 Found pattern {pattern} from answer {j}")
            
            # Check if first answer pattern exists anywhere
            first_pattern_found = False
            for turn in turns:
                answer_content = turn.get('answer', '') or ''
                if "111111" in answer_content:
                    first_pattern_found = True
                    break
            
            if i == 1:
                if first_pattern_found:
                    print(f"   ✅ First answer pattern FOUND in turns")
                else:
                    print(f"   ❌ First answer pattern MISSING from turns")
            
        else:
            print(f"❌ Failed to submit answer {i}: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Generate next question (except for last answer)
        if i < len(PHASE2_ANSWERS):
            print(f"🔄 Generating next AI question...")
            response2 = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/generate")
            if response2.status_code == 200:
                data2 = response2.json()
                turns_after_gen = data2.get('turns', [])
                print(f"✅ Next question generated")
                print(f"📊 Total turns after question generation: {len(turns_after_gen)}")
                
                # Check again if first pattern still exists after question generation
                first_pattern_still_exists = False
                for turn in turns_after_gen:
                    answer_content = turn.get('answer', '') or ''
                    if "111111" in answer_content:
                        first_pattern_still_exists = True
                        break
                
                if i == 1:  # After first answer
                    if first_pattern_still_exists:
                        print(f"   ✅ First pattern STILL EXISTS after question generation")
                    else:
                        print(f"   🚨 First pattern DISAPPEARED after question generation!")
            else:
                print(f"⚠️  Failed to generate next question: {response2.status_code}")
    
    return True

def check_final_turns():
    """Check final turns state"""
    print(f"\n📊 CHECKING FINAL TURNS STATE...")
    
    response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/turns")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved turns data")
        
        phase2_turns = data.get('phase2_turns', [])
        print(f"📊 Phase 2 turns: {len(phase2_turns)}")
        
        for i, turn in enumerate(phase2_turns):
            asker = turn.get('asker', 'unknown')
            answer_content = turn.get('answer', '') or ''
            answer_preview = answer_content[:50] if answer_content else 'None'
            print(f"   Turn {i+1}: {asker} - {answer_preview}...")
            
            # Check patterns
            for j, pattern in enumerate(["111111", "222222", "333333"], 1):
                if pattern in answer_content:
                    print(f"      🎯 Contains pattern {pattern}")
        
        return True
    else:
        print(f"❌ Failed to get turns: {response.status_code}")
        # Try alternative endpoint
        response2 = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/info")
        if response2.status_code == 200:
            data2 = response2.json()
            print(f"✅ Got session info instead")
            return True
        return False

def run_debug():
    """Run the complete debug process"""
    print("🚨 DEBUGGING MISSING FIRST ANSWER IN PHASE 2")
    print("=" * 70)
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🆔 Debug Team ID: {TEST_TEAM_ID}")
    print(f"🎯 Goal: Find why first answer '111111...' disappears")
    print("=" * 70)
    
    # Step 1: Setup
    if not setup_session():
        print("❌ CRITICAL: Setup failed")
        return False
    
    # Step 2: Answer questions with detailed debugging
    if not answer_questions_step_by_step():
        print("❌ CRITICAL: Question answering failed")
        return False
    
    # Step 3: Check final state
    check_final_turns()
    
    print("\n" + "=" * 70)
    print("🏁 DEBUG COMPLETED")
    print("=" * 70)
    print("💡 Check the debug output above to see:")
    print("   1. When the first answer '111111...' gets lost")
    print("   2. If it's lost during submission or question generation")
    print("   3. The exact turn structure at each step")
    
    return True

if __name__ == "__main__":
    run_debug() 