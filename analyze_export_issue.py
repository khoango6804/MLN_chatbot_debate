#!/usr/bin/env python3
"""
Phân tích chi tiết vấn đề export function để hiểu tại sao Turn 1 không hiển thị đúng
"""

import requests
import json

def analyze_export_issue():
    """Phân tích chi tiết vấn đề export"""
    
    base_url = "http://localhost:8000/api"
    team_id = "debug_turn1_1752552988"  # Session vừa tạo
    
    print("🔍 PHÂN TÍCH CHI TIẾT VẤN ĐỀ EXPORT")
    print("=" * 60)
    
    # Step 1: Lấy raw session data
    print("📊 Step 1: Raw session turns data")
    turns_response = requests.get(f"{base_url}/debate/{team_id}/turns")
    
    if turns_response.status_code == 200:
        turns_data = turns_response.json()
        phase2_turns = turns_data.get('phase2_turns', [])
        
        print(f"Total Phase 2 turns: {len(phase2_turns)}")
        print("\n🔍 RAW TURNS (thứ tự thực tế):")
        
        ai_questions_raw = []
        student_answers_raw = []
        
        for i, turn in enumerate(phase2_turns):
            turn_num = i + 1
            asker = turn.get('asker', 'unknown')
            question = turn.get('question', '')
            answer = turn.get('answer', '')
            
            print(f"\nTurn {turn_num}: {asker}")
            print(f"  Question: '{question[:60]}{'...' if len(question) > 60 else ''}'")
            print(f"  Answer: '{answer[:60]}{'...' if len(answer) > 60 else ''}'")
            
            # Simulate export logic
            if asker == 'ai' and question:
                ai_questions_raw.append(question)
                print(f"  → Added to AI questions array at index {len(ai_questions_raw)-1}")
                
            elif asker == 'student' and answer:
                student_answers_raw.append(answer)
                print(f"  → Added to student answers array at index {len(student_answers_raw)-1}")
                
                # Check for patterns
                if '111111' in answer:
                    print(f"  ⭐ CONTAINS 111111 PATTERN - Should be Turn 1 answer")
                elif '222222' in answer:
                    print(f"  ⭐ CONTAINS 222222 PATTERN - Should be Turn 2 answer")
        
        print(f"\n📋 EXPORT ARRAYS:")
        print(f"AI Questions collected: {len(ai_questions_raw)}")
        for i, q in enumerate(ai_questions_raw):
            print(f"  Q{i+1}: {q[:50]}...")
            
        print(f"\nStudent Answers collected: {len(student_answers_raw)}")
        for i, a in enumerate(student_answers_raw):
            print(f"  A{i+1}: {a[:50]}...")
            if '111111' in a:
                print(f"       ⭐ This is the 111111 answer (should be Turn 1)")
            elif '222222' in a:
                print(f"       ⭐ This is the 222222 answer (should be Turn 2)")
        
        print(f"\n🔗 EXPORT PAIRING LOGIC:")
        max_pairs = max(len(ai_questions_raw), len(student_answers_raw))
        
        for i in range(max_pairs):
            ai_q = ai_questions_raw[i] if i < len(ai_questions_raw) else 'NO QUESTION'
            student_a = student_answers_raw[i] if i < len(student_answers_raw) else 'NO ANSWER'
            
            print(f"\nExport Lượt {i+1}:")
            print(f"  🤖 AI hỏi: {ai_q[:50]}...")
            print(f"  👥 Team trả lời: {student_a[:50]}...")
            
            if '111111' in student_a:
                print(f"       ✅ This pair shows 111111 answer in Export Turn {i+1}")
            elif '222222' in student_a:
                print(f"       ✅ This pair shows 222222 answer in Export Turn {i+1}")
        
        print(f"\n🎯 ANALYSIS CONCLUSION:")
        if len(student_answers_raw) > 0:
            first_answer = student_answers_raw[0]
            if '111111' in first_answer:
                print(f"✅ EXPORT IS CORRECT: 111111 answer appears in Export Turn 1")
                print(f"   Your UI might be showing different data or caching old data")
            else:
                print(f"❌ EXPORT ISSUE: 111111 answer NOT in first position")
                print(f"   First answer is: {first_answer[:60]}...")
        
        # Check current session info
        print(f"\n📱 SESSION INFO CHECK:")
        info_response = requests.get(f"{base_url}/debate/{team_id}/info")
        if info_response.status_code == 200:
            info_data = info_response.json()
            print(f"Session status: {info_data.get('status', 'unknown')}")
            print(f"Current phase: {info_data.get('current_phase', 'unknown')}")
            
    else:
        print(f"❌ Could not get turns data: {turns_response.text}")
    
    print(f"\n" + "=" * 60)
    print(f"🔗 Check export manually: http://localhost:8000/api/debate/{team_id}/export_docx")

if __name__ == "__main__":
    analyze_export_issue() 