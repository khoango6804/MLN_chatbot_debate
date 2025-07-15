#!/usr/bin/env python3

import os
import sys
import re

def add_admin_routes_to_main():
    """Add admin routes to main.py if they don't exist"""
    
    main_py_path = "backend/main.py"
    
    if not os.path.exists(main_py_path):
        print("❌ backend/main.py không tồn tại")
        return False
    
    # Read current content
    with open(main_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if admin routes already exist
    if '/admin/' in content and 'sessions' in content:
        print("✅ Admin routes đã tồn tại")
        return True
    
    print("⚠️  Admin routes thiếu, đang thêm...")
    
    # Backup original file
    backup_path = f"{main_py_path}.backup.admin.{os.getpid()}"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"📦 Backup saved to {backup_path}")
    
    # Admin routes to add
    admin_routes = '''

# Admin Routes
@app.get("/api/admin/sessions")
async def get_admin_sessions():
    """Get all debate sessions for admin dashboard"""
    try:
        # This is a placeholder - replace with actual database logic
        sessions = [
            {
                "id": 1,
                "topic": "AI vs Human Intelligence",
                "status": "completed",
                "participants": 2,
                "created_at": "2024-01-01T10:00:00Z"
            },
            {
                "id": 2,
                "topic": "Climate Change Solutions",
                "status": "active",
                "participants": 1,
                "created_at": "2024-01-02T14:30:00Z"
            }
        ]
        return {"sessions": sessions, "total": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        stats = {
            "total_sessions": 25,
            "active_sessions": 3,
            "total_users": 150,
            "active_users": 12
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "AI Debate System API is running"}

@app.get("/api/admin/users")
async def get_admin_users():
    """Get all users for admin dashboard"""
    try:
        users = [
            {
                "id": 1,
                "username": "student1",
                "email": "student1@fpt.edu.vn",
                "role": "student",
                "created_at": "2024-01-01T10:00:00Z"
            },
            {
                "id": 2,
                "username": "admin",
                "email": "admin@fpt.edu.vn", 
                "role": "admin",
                "created_at": "2024-01-01T09:00:00Z"
            }
        ]
        return {"users": users, "total": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''
    
    # Find a good place to insert the routes (before the last lines)
    lines = content.split('\n')
    
    # Look for the end of existing route definitions
    insert_index = len(lines)
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        if line.startswith('if __name__') or line.startswith('uvicorn.run'):
            insert_index = i
            break
        elif line.startswith('@app.') or line.startswith('async def') or line.startswith('def '):
            insert_index = i + 1
            break
    
    # Insert admin routes
    lines.insert(insert_index, admin_routes)
    
    # Write updated content
    updated_content = '\n'.join(lines)
    
    with open(main_py_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("✅ Admin routes đã được thêm vào main.py")
    return True

def check_imports(main_py_path):
    """Ensure required imports exist"""
    
    with open(main_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_imports = [
        'from fastapi import FastAPI, HTTPException',
        'from fastapi.middleware.cors import CORSMiddleware',
        'from fastapi.staticfiles import StaticFiles'
    ]
    
    missing_imports = []
    for imp in required_imports:
        if imp not in content and imp.split('import')[1].strip() not in content:
            missing_imports.append(imp)
    
    if missing_imports:
        print("⚠️  Missing imports detected, adding...")
        
        lines = content.split('\n')
        
        # Find where to insert imports (after existing imports)
        insert_index = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import') or line.strip().startswith('from'):
                insert_index = i + 1
        
        # Insert missing imports
        for imp in missing_imports:
            lines.insert(insert_index, imp)
            insert_index += 1
        
        updated_content = '\n'.join(lines)
        with open(main_py_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print("✅ Missing imports added")

def main():
    print("🔧 ADDING ADMIN ROUTES TO BACKEND")
    print("=================================")
    
    if not os.path.exists("backend"):
        print("❌ backend/ directory không tồn tại")
        sys.exit(1)
    
    # Change to project root if we're not there
    if os.path.basename(os.getcwd()) != "MLN_chatbot_debate":
        if os.path.exists("MLN_chatbot_debate"):
            os.chdir("MLN_chatbot_debate")
    
    main_py_path = "backend/main.py"
    
    # Check and add imports
    if os.path.exists(main_py_path):
        check_imports(main_py_path)
    
    # Add admin routes
    success = add_admin_routes_to_main()
    
    if success:
        print("\n🎯 HOÀN THÀNH!")
        print("==============")
        print("✅ Admin routes đã được thêm")
        print("📋 Next steps:")
        print("1. Restart backend: pkill -f uvicorn && cd backend && uvicorn main:app --host 0.0.0.0 --port 5000 --reload &")
        print("2. Test API: curl http://localhost:5000/api/admin/sessions")
        print("3. Test health: curl http://localhost:5000/api/health")
    else:
        print("\n❌ THẤT BẠI!")
        print("Không thể thêm admin routes")
        sys.exit(1)

if __name__ == "__main__":
    main() 