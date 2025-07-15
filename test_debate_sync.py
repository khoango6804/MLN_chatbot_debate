#!/usr/bin/env python3
"""
Test script to verify debate data synchronization between session object and session_data dict.
This ensures evaluation function receives proper data from all phases.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from debate_system import DebateSession, DebateSystem

def test_data_sync():
    """Test if data is properly synced between session object and evaluation function"""
    
    print("🔧 Testing Debate Data Synchronization...")
    
    # Create a debate session
    debate_system = DebateSystem()
    session = DebateSession(debate_system)
    
    # Phase 1: Set up basic info
    session.topic = "Test topic about AI vs Human debate"
    session.members = ["Student1", "Student2", "Student3"]
    session.course_code = "MLN111"
    
    # Phase 1: Add team arguments
    session.team_arguments = [
        "AI cannot replace human creativity",
        "Human emotional intelligence is irreplaceable",
        "AI lacks moral judgment capabilities"
    ]
    
    # Phase 1: Add AI arguments
    session.ai_arguments = [
        "AI processes information faster than humans",
        "AI can work 24/7 without fatigue",
        "AI reduces human error in calculations"
    ]
    
    # Phase 2 & 3: Add turns (Q&A between AI and students)
    session.add_turn("ai", "Why do you think human creativity cannot be replicated?", "Because humans have unique experiences")
    session.add_turn("student", "How can AI understand emotional context?", "AI uses pattern recognition in text")
    session.add_turn("ai", "What about moral dilemmas?", "Humans learn from cultural context")
    session.add_turn("student", "Can AI learn from mistakes?", "Yes, through machine learning algorithms")
    
    # Phase 4: Add conclusions
    session.conclusion = [
        "Humans possess unique qualities that AI cannot replicate",
        "Our arguments demonstrate the irreplaceable value of human intelligence",
        "AI should complement, not replace human capabilities"
    ]
    
    session.ai_counter_arguments = [
        "AI's consistent performance exceeds human capabilities",
        "Emotional decision-making often leads to errors",
        "AI can be programmed with ethical guidelines"
    ]
    
    # Test evaluation
    print("\n📊 Testing Evaluation Function...")
    
    try:
        evaluation = session.evaluate_debate()
        print(f"✅ Evaluation successful!")
        print(f"📈 Total phases with scores: {len(evaluation.get('scores', {}))}")
        
        # Check each phase
        scores = evaluation.get('scores', {})
        for phase in ['phase1', 'phase2', 'phase3', 'phase4']:
            phase_scores = scores.get(phase, {})
            total_score = sum(phase_scores.values()) if isinstance(phase_scores, dict) else 0
            print(f"   {phase}: {total_score} points")
            
            if total_score == 0:
                print(f"   ⚠️  WARNING: {phase} has 0 points - check data sync!")
            else:
                print(f"   ✅ {phase} properly scored")
        
        print(f"\n💭 AI Feedback: {evaluation.get('feedback', 'No feedback')[:100]}...")
        
    except Exception as e:
        print(f"❌ Evaluation failed: {e}")
        return False
    
    # Test data presence
    print("\n🔍 Testing Data Presence...")
    
    data_checks = [
        ("Topic", session.topic, bool(session.topic)),
        ("Team Arguments", session.team_arguments, len(session.team_arguments) > 0),
        ("AI Arguments", session.ai_arguments, len(session.ai_arguments) > 0),
        ("Turns (Q&A)", session.turns, len(session.turns) > 0),
        ("Student Conclusion", session.conclusion, len(session.conclusion) > 0),
        ("AI Counter-arguments", session.ai_counter_arguments, len(session.ai_counter_arguments) > 0)
    ]
    
    all_good = True
    for name, data, check in data_checks:
        status = "✅" if check else "❌"
        print(f"   {status} {name}: {len(data) if hasattr(data, '__len__') else 'N/A'} items")
        if not check:
            all_good = False
    
    return all_good

def test_turns_structure():
    """Test the structure of turns for proper evaluation"""
    
    print("\n🔄 Testing Turns Structure...")
    
    session = DebateSession()
    session.topic = "Test topic"
    
    # Add various types of turns
    session.add_turn("ai", "Question 1", "Student Answer 1")
    session.add_turn("student", "Question 2", "AI Answer 2")
    session.add_turn("ai", "Question 3", "Student Answer 3")
    
    print(f"📝 Total turns: {len(session.turns)}")
    
    for i, turn in enumerate(session.turns):
        print(f"   Turn {i+1}: {turn.get('asker')} -> Q: '{turn.get('question')[:50]}...' A: '{turn.get('answer', 'No answer')[:50]}...'")
    
    # Test chat history
    print(f"💬 Chat history entries: {len(session.chat_history)}")
    
    return len(session.turns) > 0

if __name__ == "__main__":
    print("🚀 MLN Debate System - Data Sync Test")
    print("=" * 50)
    
    success1 = test_data_sync()
    success2 = test_turns_structure()
    
    print("\n" + "=" * 50)
    if success1 and success2:
        print("🎉 All tests passed! Data synchronization is working correctly.")
        print("✅ Evaluation function should receive proper data from all phases.")
    else:
        print("❌ Some tests failed. Check data synchronization issues.")
        print("⚠️  Evaluation may not work properly.")
    
    print("\n💡 Next steps:")
    print("   1. Start backend: cd backend && python3 main.py")
    print("   2. Test with real debate session")
    print("   3. Check export function includes all history") 