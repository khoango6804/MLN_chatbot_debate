#!/usr/bin/env python3
"""
TEST: FRONTEND API CALLS
Kiểm tra các API endpoints mà frontend sử dụng để lấy Phase 2 data
Mục đích: Tìm hiểu tại sao frontend không hiển thị đúng data từ backend
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = "DEBUG_MISSING_FIRST_1752555376"  # Session vừa tạo có đầy đủ data

def test_session_info_endpoint():
    """Test endpoint /api/debate/{team_id}/info - endpoint chính frontend dùng"""
    print("🔍 TESTING SESSION INFO ENDPOINT...")
    
    response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/info")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Session info endpoint successful")
        print(f"📊 Response keys: {list(data.keys())}")
        
        # Check important fields
        important_fields = ['team_id', 'current_phase', 'turns_taken', 'arguments', 'ai_questions']
        for field in important_fields:
            if field in data:
                value = data[field]
                if isinstance(value, list):
                    print(f"   {field}: {len(value)} items")
                else:
                    print(f"   {field}: {value}")
            else:
                print(f"   ❌ Missing field: {field}")
        
        return data
    else:
        print(f"❌ Session info failed: {response.status_code}")
        return None

def test_turns_endpoint():
    """Test endpoint for getting turns data"""
    print("\n🔍 TESTING TURNS ENDPOINT...")
    
    # Try different possible endpoints for turns
    endpoints_to_try = [
        f"/api/debate/{TEST_TEAM_ID}/turns",
        f"/api/debate/{TEST_TEAM_ID}/phase2/turns", 
        f"/api/debate/{TEST_TEAM_ID}/data",
        f"/api/debate/{TEST_TEAM_ID}/history"
    ]
    
    for endpoint in endpoints_to_try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"📡 Testing {endpoint}: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success! Response keys: {list(data.keys())}")
            
            # Look for Phase 2 data
            for key in data.keys():
                if 'phase2' in key.lower() or 'turn' in key.lower():
                    value = data[key]
                    if isinstance(value, list):
                        print(f"   📋 {key}: {len(value)} items")
                        
                        # Check for our patterns in the data
                        for i, item in enumerate(value):
                            if isinstance(item, dict) and 'answer' in item:
                                answer = item.get('answer', '') or ''
                                for pattern in ['111111', '222222', '333333']:
                                    if pattern in answer:
                                        print(f"      🎯 Item {i+1} contains pattern {pattern}")
            return data
        elif response.status_code == 404:
            print(f"   ⚠️  Endpoint not found")
        else:
            print(f"   ❌ Error: {response.status_code}")
    
    return None

def simulate_frontend_flow():
    """Simulate the exact flow frontend would use"""
    print("\n🎭 SIMULATING FRONTEND FLOW...")
    
    # Step 1: Get session info (main call frontend makes)
    print("1️⃣ Frontend calls session info...")
    session_data = test_session_info_endpoint()
    
    if not session_data:
        print("❌ Cannot continue without session data")
        return
    
    # Step 2: Check if session data contains Phase 2 turns
    print("\n2️⃣ Checking if session data contains Phase 2 turns...")
    
    # Frontend might be looking for these fields
    phase2_data_fields = ['turns', 'phase2_turns', 'chat_history', 'debate_turns']
    
    found_phase2_data = False
    for field in phase2_data_fields:
        if field in session_data:
            value = session_data[field]
            if isinstance(value, list) and len(value) > 0:
                print(f"   ✅ Found {field} with {len(value)} items")
                found_phase2_data = True
                
                # Analyze the structure
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        print(f"      Item {i+1}: {list(item.keys())}")
                        
                        # Check for our test patterns
                        if 'answer' in item:
                            answer = item.get('answer', '') or ''
                            for pattern in ['111111', '222222', '333333']:
                                if pattern in answer:
                                    print(f"         🎯 Contains pattern {pattern}")
            else:
                print(f"   ⚠️  {field} is empty or not a list")
    
    if not found_phase2_data:
        print("   ❌ No Phase 2 turns data found in session info!")
        print("   💡 This could be why frontend doesn't show the data")
    
    # Step 3: Try alternative endpoints frontend might use
    print("\n3️⃣ Trying alternative endpoints...")
    test_turns_endpoint()

def check_response_format():
    """Check the exact format of responses"""
    print("\n📋 CHECKING RESPONSE FORMAT DETAILS...")
    
    response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/info")
    if response.status_code == 200:
        data = response.json()
        
        # Pretty print the full response for debugging
        print("📄 FULL SESSION INFO RESPONSE:")
        print(json.dumps(data, indent=2, ensure_ascii=False)[:2000] + "...")
        
        return data
    return None

def main():
    """Main test execution"""
    print("🔍 FRONTEND API CALLS DEBUG")
    print("=" * 60)
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🆔 Testing Team ID: {TEST_TEAM_ID}")
    print(f"🎯 Goal: Find why frontend doesn't show first answer")
    print("=" * 60)
    
    # Run tests
    simulate_frontend_flow()
    
    # Show detailed response format
    check_response_format()
    
    print("\n" + "=" * 60)
    print("🏁 FRONTEND API DEBUG COMPLETED")
    print("=" * 60)
    print("💡 Key findings:")
    print("   1. Backend HAS all 3 patterns (111111, 222222, 333333)")
    print("   2. Check if frontend is calling correct endpoints")
    print("   3. Check if frontend is parsing response correctly")
    print("   4. Issue might be in UI rendering logic")

if __name__ == "__main__":
    main() 