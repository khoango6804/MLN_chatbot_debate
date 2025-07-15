#!/bin/bash

echo "🏥 AI Debate System Health Check"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Backend API
echo -e "${BLUE}📊 Checking Backend API...${NC}"
if curl -s http://localhost:5000/api/admin/sessions > /dev/null; then
    echo -e "${GREEN}✅ Backend API (Port 5000): HEALTHY${NC}"
    BACKEND_STATUS="HEALTHY"
else
    echo -e "${RED}❌ Backend API (Port 5000): DOWN${NC}"
    BACKEND_STATUS="DOWN"
fi

# Check React Frontend
echo -e "${BLUE}🎨 Checking React Frontend...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ React Frontend (Port 3001): HEALTHY${NC}"
    FRONTEND_STATUS="HEALTHY"
else
    echo -e "${RED}❌ React Frontend (Port 3001): DOWN${NC}"
    FRONTEND_STATUS="DOWN"
fi

# Check Nginx
echo -e "${BLUE}🌐 Checking Nginx Reverse Proxy...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx Service: RUNNING${NC}"
    NGINX_STATUS="RUNNING"
else
    echo -e "${RED}❌ Nginx Service: STOPPED${NC}"
    NGINX_STATUS="STOPPED"
fi

# Check HTTPS Domain
echo -e "${BLUE}🔒 Checking HTTPS Domain...${NC}"
if curl -I https://mlndebate.io.vn 2>/dev/null | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ HTTPS Domain (mlndebate.io.vn): ACCESSIBLE${NC}"
    DOMAIN_STATUS="ACCESSIBLE"
else
    echo -e "${RED}❌ HTTPS Domain (mlndebate.io.vn): UNREACHABLE${NC}"
    DOMAIN_STATUS="UNREACHABLE"
fi

# Check API via HTTPS
echo -e "${BLUE}🔗 Checking API via HTTPS...${NC}"
if curl -I https://mlndebate.io.vn/api/admin/sessions 2>/dev/null | grep -q "200\|405"; then
    echo -e "${GREEN}✅ HTTPS API: ACCESSIBLE${NC}"
    API_HTTPS_STATUS="ACCESSIBLE"
else
    echo -e "${RED}❌ HTTPS API: UNREACHABLE${NC}"
    API_HTTPS_STATUS="UNREACHABLE"
fi

# Check processes
echo -e "${BLUE}⚡ Checking Running Processes...${NC}"
BACKEND_PROCS=$(pgrep -f "python3 main.py" | wc -l)
FRONTEND_PROCS=$(pgrep -f "react-scripts" | wc -l)

echo "Backend processes: $BACKEND_PROCS"
echo "Frontend processes: $FRONTEND_PROCS"

# Overall system status
echo ""
echo "📋 SYSTEM SUMMARY:"
echo "=================="
echo "Backend API:       $BACKEND_STATUS"
echo "React Frontend:    $FRONTEND_STATUS"
echo "Nginx Service:     $NGINX_STATUS"
echo "HTTPS Domain:      $DOMAIN_STATUS"
echo "HTTPS API:         $API_HTTPS_STATUS"

# Determine overall health
if [[ "$BACKEND_STATUS" == "HEALTHY" && "$FRONTEND_STATUS" == "HEALTHY" && 
      "$NGINX_STATUS" == "RUNNING" && "$DOMAIN_STATUS" == "ACCESSIBLE" ]]; then
    echo -e "${GREEN}🎉 OVERALL STATUS: SYSTEM HEALTHY${NC}"
    exit 0
elif [[ "$BACKEND_STATUS" == "HEALTHY" && "$NGINX_STATUS" == "RUNNING" ]]; then
    echo -e "${YELLOW}⚠️  OVERALL STATUS: PARTIAL (Backend OK, Frontend may be starting)${NC}"
    exit 1
else
    echo -e "${RED}🚨 OVERALL STATUS: SYSTEM UNHEALTHY${NC}"
    echo ""
    echo "🔧 TROUBLESHOOTING STEPS:"
    echo "========================"
    
    if [[ "$BACKEND_STATUS" == "DOWN" ]]; then
        echo "• Restart Backend: cd backend && python3 main.py &"
    fi
    
    if [[ "$FRONTEND_STATUS" == "DOWN" ]]; then
        echo "• Restart Frontend: cd frontend && PORT=3001 npm start &"
    fi
    
    if [[ "$NGINX_STATUS" == "STOPPED" ]]; then
        echo "• Restart Nginx: sudo systemctl restart nginx"
    fi
    
    echo "• Run full restart: ./start_services.sh"
    exit 2
fi 