#!/bin/bash

echo "🔍 Testing form submission with exact user data..."

# Test with the exact data the user submitted
echo "📤 Testing with data: team_id='hj', members=['sdf','dsf','dsf','dsf','dsf'], course='MLN111'"

# Test direct backend call
echo "🔧 Testing direct backend call..."
curl -X POST http://localhost:5000/api/debate/start \
  -H "Content-Type: application/json" \
  -d '{"members":["sdf","dsf","dsf","dsf","dsf"], "course_code":"MLN111", "team_id":"hj"}' \
  -w "\n📊 Status: %{http_code}, Time: %{time_total}s\n"

echo ""

# Test through nginx proxy
echo "🌐 Testing through nginx proxy..."
curl -X POST https://mlndebate.io.vn/api/debate/start \
  -H "Content-Type: application/json" \
  -d '{"members":["sdf","dsf","dsf","dsf","dsf"], "course_code":"MLN111", "team_id":"hj2"}' \
  -w "\n📊 Status: %{http_code}, Time: %{time_total}s\n" \
  --max-time 30

echo ""

# Test info endpoint
echo "🔍 Testing info endpoint..."
curl -X GET http://localhost:5000/api/debate/hj/info \
  -w "\n📊 Status: %{http_code}, Time: %{time_total}s\n"

echo ""

# Test through nginx
echo "🌐 Testing info through nginx..."
curl -X GET https://mlndebate.io.vn/api/debate/hj2/info \
  -w "\n📊 Status: %{http_code}, Time: %{time_total}s\n" \
  --max-time 30

echo "✅ Debug complete!" 