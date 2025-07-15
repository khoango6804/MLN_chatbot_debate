#!/usr/bin/env python3
import requests
import time

BASE_URL = "http://localhost:5000"
TEST_TEAM_ID = f"QUICK_TEST_{int(time.time())}"

def quick_test():
    print(f"🔥 QUICK TEST - Team ID: {TEST_TEAM_ID}")
    
    # 1. Create session
    payload = {
        "course_code": "QUICK_TEST",
        "members": ["Quick Test Student"],
        "team_id": TEST_TEAM_ID
    }
    response = requests.post(f"{BASE_URL}/api/debate/start", json=payload)
    print(f"1. Create session: {response.status_code}")
    if response.status_code != 200:
        return False
    
    # 2. Submit arguments to start Phase 2
    team_args = ["QUICK_TEST_ARG_111111", "QUICK_TEST_ARG_222222"]
    payload = {"team_arguments": team_args}
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2", json=payload)
    print(f"2. Submit args: {response.status_code}")
    if response.status_code != 200:
        return False
    
    # 3. Start Phase 2
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/phase2/start")
    print(f"3. Start Phase 2: {response.status_code}")
    if response.status_code != 200:
        return False
    
    # 4. Answer one AI question
    payload = {
        "answer": "QUICK_ANSWER_111111 - Test answer for Phase 2",
        "asker": "ai",
        "question": "Test question"
    }
    response = requests.post(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/ai-question/turn", json=payload)
    print(f"4. Answer question: {response.status_code}")
    if response.status_code != 200:
        print(f"   Error: {response.text}")
        return False
    
    # 5. Test export
    response = requests.get(f"{BASE_URL}/api/debate/{TEST_TEAM_ID}/export")
    print(f"5. Export: {response.status_code}")
    if response.status_code == 200:
        filename = f"quick_export_{TEST_TEAM_ID}.docx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"   ✅ Export saved: {filename} ({len(response.content)} bytes)")
        return True
    else:
        print(f"   Error: {response.text}")
        return False

if __name__ == "__main__":
    success = quick_test()
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}") 