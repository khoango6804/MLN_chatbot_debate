#!/usr/bin/env python3
"""
Test script cho Multiple API Keys system
Kiểm tra xem hệ thống có load được nhiều keys và failover không
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from debate_system import DebateSystem
import time

def test_multiple_keys():
    print("🧪 TESTING MULTIPLE API KEYS SYSTEM")
    print("=" * 50)
    
    try:
        # Initialize DebateSystem
        print("1️⃣ Initializing DebateSystem...")
        debate_system = DebateSystem()
        
        print(f"✅ Loaded {len(debate_system.api_keys)} API keys")
        print(f"🎯 Current key index: {debate_system.current_key_index + 1}")
        print(f"❌ Failed keys: {debate_system.failed_keys}")
        
        # Test 1: Generate topic
        print("\n2️⃣ Testing generate_debate_topic...")
        topic = debate_system.generate_debate_topic("MLN111")
        print(f"✅ Generated topic: {topic[:100]}...")
        
        # Test 2: Generate arguments  
        print("\n3️⃣ Testing generate_arguments...")
        args = debate_system.generate_arguments(topic, "supporting")
        print(f"✅ Generated {len(args)} arguments")
        for i, arg in enumerate(args[:2]):  # Show first 2
            print(f"   Arg {i+1}: {arg[:100]}...")
        
        # Test 3: Generate questions
        print("\n4️⃣ Testing generate_questions...")
        questions = debate_system.generate_questions(args, topic)
        print(f"✅ Generated {len(questions)} questions")
        for i, q in enumerate(questions[:1]):  # Show first 1
            print(f"   Q{i+1}: {q[:100]}...")
        
        print(f"\n🎯 Final key index: {debate_system.current_key_index + 1}")
        print(f"❌ Failed keys: {debate_system.failed_keys}")
        
        print("\n🎉 ALL TESTS PASSED!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False
    
    return True

def test_key_loading():
    """Test chỉ phần load keys"""
    print("\n🔧 TESTING KEY LOADING ONLY")
    print("=" * 30)
    
    try:
        from debate_system import DebateSystem
        system = DebateSystem()
        
        print(f"📊 Statistics:")
        print(f"   • Total keys loaded: {len(system.api_keys)}")
        print(f"   • Current key index: {system.current_key_index + 1}")
        print(f"   • Failed keys: {len(system.failed_keys)}")
        print(f"   • Reset interval: {system.reset_interval}s")
        
        # Show first 3 characters of each key for verification
        for i, key in enumerate(system.api_keys):
            masked_key = key[:3] + "*" * (len(key) - 6) + key[-3:] if len(key) > 6 else "***"
            print(f"   • Key {i+1}: {masked_key}")
            
        return True
        
    except Exception as e:
        print(f"❌ Key loading failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 MULTIPLE API KEYS TEST SUITE")
    print("=" * 60)
    
    # Test 1: Key loading
    if not test_key_loading():
        print("\n💡 TIP: Make sure you have valid API keys in your .env file")
        sys.exit(1)
    
    # Test 2: Full functionality (only if keys are loaded successfully)
    print("\n" + "=" * 60)
    if test_multiple_keys():
        print("\n✅ All systems operational! Multiple API keys working correctly.")
    else:
        print("\n❌ Some tests failed. Check your API keys and quotas.") 