#!/usr/bin/env python3
"""
Test script to verify the export function correctly separates Phase 2 and Phase 3 data
after fixing the export logic to use proper data structures.
"""

import requests
import json
import sys
import time

def test_export_data_separation():
    """Test that export correctly separates Phase 2 and Phase 3 data"""
    
    base_url = "http://localhost:8000/api"
    
    # Test session ID
    team_id = f"export_fix_test_{int(time.time())}"
    
    print("🧪 EXPORT FIX VERIFICATION TEST")
    print("=" * 50)
    
    try:
        # Step 1: Create session
        print("📝 Step 1: Creating test session...")
        start_response = requests.post(f"{base_url}/debate/start", json={
            "team_id": team_id,
            "members": ["Export Test Student A", "Export Test Student B"],
            "course_code": "MLN111",
            "topic": "Test topic for export verification"
        })
        
        if start_response.status_code != 200:
            print(f"❌ Failed to create session: {start_response.text}")
            return
        
        print(f"✅ Session created: {team_id}")
        
        # Step 2: Submit team arguments (Phase 1)
        print("\n📝 Step 2: Submitting team arguments...")
        args_response = requests.post(f"{base_url}/debate/{team_id}/arguments", json={
            "team_id": team_id,
            "arguments": [
                "PHASE1_ARG1 First team argument with unique identifier",
                "PHASE1_ARG2 Second team argument for testing",
                "PHASE1_ARG3 Third team argument for verification"
            ]
        })
        
        if args_response.status_code != 200:
            print(f"❌ Failed to submit arguments: {args_response.text}")
            return
        
        print("✅ Team arguments submitted")
        
        # Step 3: Generate AI arguments
        print("\n📝 Step 3: Generating AI arguments...")
        ai_args_response = requests.post(f"{base_url}/debate/{team_id}/phase1")
        
        if ai_args_response.status_code != 200:
            print(f"❌ Failed to generate AI arguments: {ai_args_response.text}")
            return
        
        print("✅ AI arguments generated")
        
        # Step 4: Start Phase 2 and get AI questions
        print("\n📝 Step 4: Starting Phase 2...")
        phase2_response = requests.post(f"{base_url}/debate/{team_id}/phase2", json={
            "team_arguments": [
                "PHASE1_ARG1 First team argument with unique identifier",
                "PHASE1_ARG2 Second team argument for testing",
                "PHASE1_ARG3 Third team argument for verification"
            ]
        })
        
        if phase2_response.status_code != 200:
            print(f"❌ Failed to start Phase 2: {phase2_response.text}")
            return
        
        print("✅ Phase 2 started with AI questions")
        
        # Step 5: Answer AI questions (Phase 2 interactions)
        phase2_answers = [
            "PHASE2_ANSWER1_111111111111 This is my first detailed response to AI question 1",
            "PHASE2_ANSWER2_222222222222 This is my second comprehensive response to AI question 2", 
            "PHASE2_ANSWER3_333333333333 This is my third thorough response to AI question 3"
        ]
        
        print("\n📝 Step 5: Submitting Phase 2 answers...")
        for i, answer in enumerate(phase2_answers, 1):
            print(f"   Submitting answer {i}...")
            
            # Submit student answer
            answer_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/turn", json={
                "answer": answer,
                "asker": "student",
                "question": f"AI Question {i}"  # This should be ignored in the fixed logic
            })
            
            if answer_response.status_code != 200:
                print(f"❌ Failed to submit answer {i}: {answer_response.text}")
                return
            
            # Generate next AI question (except for last answer)
            if i < len(phase2_answers):
                gen_response = requests.post(f"{base_url}/debate/{team_id}/ai-question/generate")
                if gen_response.status_code != 200:
                    print(f"⚠️  Warning: Failed to generate next AI question: {gen_response.text}")
            
            time.sleep(0.5)  # Brief pause between operations
        
        print("✅ All Phase 2 answers submitted")
        
        # Step 6: Submit Phase 3 questions (Student asks AI)
        phase3_questions = [
            "PHASE3_QUESTION1_444444444444 What is your perspective on this complex issue?",
            "PHASE3_QUESTION2_555555555555 How do you respond to our counterarguments?"
        ]
        
        print("\n📝 Step 6: Submitting Phase 3 questions...")
        for i, question in enumerate(phase3_questions, 1):
            print(f"   Submitting question {i}...")
            
            # Submit student question (Phase 3)
            question_response = requests.post(f"{base_url}/debate/{team_id}/student-question/turn", json={
                "question": question
            })
            
            if question_response.status_code != 200:
                print(f"❌ Failed to submit Phase 3 question {i}: {question_response.text}")
                return
            
            time.sleep(0.5)  # Brief pause
        
        print("✅ All Phase 3 questions submitted")
        
        # Step 7: Get the export and verify data separation
        print("\n📝 Step 7: Testing export data separation...")
        export_response = requests.get(f"{base_url}/debate/{team_id}/export_docx")
        
        if export_response.status_code != 200:
            print(f"❌ Failed to export: {export_response.text}")
            return
        
        # Save export for manual inspection
        with open(f"export_fix_test_{team_id}.docx", "wb") as f:
            f.write(export_response.content)
        
        print(f"✅ Export saved as: export_fix_test_{team_id}.docx")
        
        # Step 8: Test session data structure directly
        print("\n📝 Step 8: Checking session data structure...")
        info_response = requests.get(f"{base_url}/debate/{team_id}/turns")
        
        if info_response.status_code == 200:
            turns_data = info_response.json()
            
            print("\n🔍 PHASE DATA ANALYSIS:")
            print("-" * 30)
            
            # Analyze Phase 2 data
            phase2_turns = turns_data.get('phase2_turns', [])
            print(f"📊 Phase 2 turns: {len(phase2_turns)}")
            for i, turn in enumerate(phase2_turns, 1):
                asker = turn.get('asker', 'unknown')
                question = turn.get('question', '')[:50]
                answer = turn.get('answer', '')[:50] if turn.get('answer') else 'None'
                print(f"   Turn {i}: {asker} - Q: \"{question}...\" A: \"{answer}...\"")
            
            # Analyze Phase 3 data
            phase3_turns = turns_data.get('phase3_turns', [])
            print(f"\n📊 Phase 3 turns: {len(phase3_turns)}")
            for i, turn in enumerate(phase3_turns, 1):
                asker = turn.get('asker', 'unknown')
                question = turn.get('question', '')[:50]
                answer = turn.get('answer', '')[:50] if turn.get('answer') else 'None'
                print(f"   Turn {i}: {asker} - Q: \"{question}...\" A: \"{answer}...\"")
            
            # Verify data integrity
            print(f"\n🎯 DATA INTEGRITY CHECK:")
            print("-" * 25)
            
            # Check if Phase 2 contains the expected patterns
            phase2_found_patterns = []
            for turn in phase2_turns:
                answer = turn.get('answer', '')
                if 'PHASE2_ANSWER1_111111111111' in answer:
                    phase2_found_patterns.append('111111... (Answer 1)')
                elif 'PHASE2_ANSWER2_222222222222' in answer:
                    phase2_found_patterns.append('222222... (Answer 2)')
                elif 'PHASE2_ANSWER3_333333333333' in answer:
                    phase2_found_patterns.append('333333... (Answer 3)')
            
            # Check if Phase 3 contains the expected patterns
            phase3_found_patterns = []
            for turn in phase3_turns:
                question = turn.get('question', '')
                if 'PHASE3_QUESTION1_444444444444' in question:
                    phase3_found_patterns.append('444444... (Question 1)')
                elif 'PHASE3_QUESTION2_555555555555' in question:
                    phase3_found_patterns.append('555555... (Question 2)')
            
            print(f"✅ Phase 2 patterns found: {phase2_found_patterns}")
            print(f"✅ Phase 3 patterns found: {phase3_found_patterns}")
            
            # Final verdict
            if (len(phase2_found_patterns) == 3 and 
                len(phase3_found_patterns) == 2 and
                '111111... (Answer 1)' in phase2_found_patterns):
                print(f"\n🎉 SUCCESS: Export function correctly separates Phase 2 and Phase 3 data!")
                print(f"   - Phase 2 has all 3 student answers (including 111111... pattern)")
                print(f"   - Phase 3 has 2 student questions")
                print(f"   - No data mixing detected")
            else:
                print(f"\n❌ ISSUE: Data separation still has problems")
                print(f"   - Expected 3 Phase 2 answers, found: {len(phase2_found_patterns)}")
                print(f"   - Expected 2 Phase 3 questions, found: {len(phase3_found_patterns)}")
        
        else:
            print(f"⚠️  Could not retrieve turns data: {info_response.text}")
        
        print("\n" + "=" * 50)
        print("🏁 EXPORT FIX TEST COMPLETED")
        print(f"📄 Review the exported file: export_fix_test_{team_id}.docx")
        print(f"🔗 Manual export URL: http://localhost:8000/api/debate/{team_id}/export_docx")
        
    except Exception as e:
        print(f"💥 Test failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_export_data_separation() 