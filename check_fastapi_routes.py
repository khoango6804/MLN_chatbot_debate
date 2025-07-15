#!/usr/bin/env python3

import sys
sys.path.append('/home/ubuntu/MLN_chatbot_debate/backend')

print("🔍 KIỂM TRA FASTAPI ROUTES")
print("==========================")
print()

try:
    # Import FastAPI app
    from main import app
    print("✅ Import app thành công")
    
    # Kiểm tra routes
    print("\n📋 DANH SÁCH ROUTES:")
    print("-" * 50)
    
    route_count = 0
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ', '.join(route.methods)
            print(f"   {methods:10} {route.path}")
            route_count += 1
        elif hasattr(route, 'path'):
            print(f"   {'':10} {route.path}")
            route_count += 1
    
    print(f"\n📊 Tổng số routes: {route_count}")
    
    # Kiểm tra các API routes cụ thể
    print("\n🎯 KIỂM TRA API ENDPOINTS:")
    print("-" * 50)
    
    expected_endpoints = [
        "/api/admin/sessions",
        "/api/admin/live-scoring", 
        "/api/debate/start",
        "/docs",
        "/openapi.json"
    ]
    
    available_paths = [route.path for route in app.routes if hasattr(route, 'path')]
    
    for endpoint in expected_endpoints:
        if endpoint in available_paths:
            print(f"   ✅ {endpoint}")
        else:
            print(f"   ❌ {endpoint} - THIẾU!")
            
    # Kiểm tra xem có prefix nào không
    print("\n🔍 ROUTER CONFIGURATION:")
    print("-" * 50)
    
    # Xem có include router với prefix không
    router_found = False
    for route in app.routes:
        if hasattr(route, 'prefix'):
            print(f"   Router prefix: {route.prefix}")
            router_found = True
            
    if not router_found:
        print("   Không tìm thấy router prefix")
        
    # Test import từng module
    print("\n🧪 TEST IMPORTS:")
    print("-" * 50)
    
    try:
        from debate_system import DebateSession, DebateSystem, DEBATE_CRITERIA
        print("   ✅ debate_system import OK")
    except Exception as e:
        print(f"   ❌ debate_system import: {e}")
        
    try:
        import uvicorn
        print("   ✅ uvicorn import OK")
    except Exception as e:
        print(f"   ❌ uvicorn import: {e}")
        
    # Kiểm tra app configuration
    print("\n⚙️  APP CONFIGURATION:")
    print("-" * 50)
    print(f"   App title: {getattr(app, 'title', 'N/A')}")
    print(f"   App version: {getattr(app, 'version', 'N/A')}")
    print(f"   Debug mode: {getattr(app, 'debug', 'N/A')}")
    
    print("\n🎉 FastAPI app đã load thành công!")
    print("Nếu vẫn lỗi 404, có thể do:")
    print("1. Uvicorn chưa khởi động đúng")
    print("2. Port conflicts")
    print("3. Network/proxy issues")
    
except ImportError as e:
    print(f"❌ Lỗi import: {e}")
    print("\nCó thể do:")
    print("- Thiếu dependencies")
    print("- Python path không đúng")
    print("- Module conflicts")
    
except Exception as e:
    print(f"❌ Lỗi khác: {e}")
    print("\nKiểm tra:")
    print("- File main.py có lỗi syntax")
    print("- Dependencies không tương thích")
    print("- Environment variables")

print("\n" + "="*50) 