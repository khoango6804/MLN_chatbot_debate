#!/bin/bash

echo "🔧 MAKING ALL SCRIPTS EXECUTABLE"
echo "================================"
echo ""

# Make all shell scripts executable
chmod +x *.sh
chmod +x *.py

echo "✅ Made executable:"
echo ""

# List all executable scripts
ls -la *.sh *.py 2>/dev/null | grep "^-rwx" | awk '{print "  " $9}'

echo ""
echo "🎯 MAIN SCRIPTS TO RUN:"
echo "======================"
echo "1. 🚀 ./ULTIMATE_FIX_WEBSOCKET_API.sh    (COMPLETE FIX)"
echo "2. 🧪 ./CHECK_FINAL_STATUS.sh             (CHECK STATUS)"
echo "3. 🔧 ./QUICK_FIX_502.sh                  (RESTART SERVICES)"
echo ""

echo "✅ All scripts are now executable!" 