#!/usr/bin/env python3

import json
import os
from pathlib import Path

def check_session_data():
    print("🔍 Checking session data...")
    
    # Find the most recent session
    data_dir = Path("data")
    if not data_dir.exists():
        print("❌ Data directory doesn't exist")
        return
    
    session_files = list(data_dir.glob("session_*.json"))
    if not session_files:
        print("❌ No session files found")
        return
    
    # Get the most recent session file
    latest_session = max(session_files, key=lambda f: f.stat().st_mtime)
    print(f"📁 Latest session: {latest_session}")
    
    with open(latest_session, 'r', encoding='utf-8') as f:
        session_data = json.load(f)
    
    print(f"📊 Total turns: {len(session_data.get('turns', []))}")
    print(f"🔍 Current phase: {session_data.get('current_phase', 'unknown')}")
    
    # Check all turns
    turns = session_data.get('turns', [])
    phase2_questions = []
    phase2_answers = []
    phase3_questions = []
    phase3_answers = []
    
    for i, turn in enumerate(turns):
        print(f"\n--- Turn {i+1} ---")
        print(f"Type: {turn.get('type', 'unknown')}")
        print(f"Phase: {turn.get('phase', 'unknown')}")
        print(f"Content: {turn.get('content', '')[:100]}...")
        
        if turn.get('phase') == 2:
            if turn.get('type') == 'ai_question':
                phase2_questions.append(turn.get('content', ''))
            elif turn.get('type') == 'student_answer':
                phase2_answers.append(turn.get('content', ''))
        elif turn.get('phase') == 3:
            if turn.get('type') == 'student_question':
                phase3_questions.append(turn.get('content', ''))
            elif turn.get('type') == 'ai_answer':
                phase3_answers.append(turn.get('content', ''))
    
    print(f"\n📋 Phase 2 Summary:")
    print(f"AI Questions: {len(phase2_questions)}")
    print(f"Student Answers: {len(phase2_answers)}")
    
    for i, answer in enumerate(phase2_answers):
        print(f"  Answer {i+1}: {answer[:50]}...")
    
    print(f"\n📋 Phase 3 Summary:")
    print(f"Student Questions: {len(phase3_questions)}")
    print(f"AI Answers: {len(phase3_answers)}")
    
    # Check specifically for the missing pattern
    missing_pattern = "111111111111"
    found_pattern = any(missing_pattern in answer for answer in phase2_answers)
    print(f"\n🔍 Pattern '{missing_pattern}' found in Phase 2 answers: {found_pattern}")
    
    if not found_pattern:
        print("❌ The '111111...' pattern is missing from stored data!")
        print("🔍 All Phase 2 answers:")
        for i, answer in enumerate(phase2_answers):
            print(f"  {i+1}: {answer}")

if __name__ == "__main__":
    check_session_data() 