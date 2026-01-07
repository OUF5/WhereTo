#!/bin/bash

# Adventure Roulette API Test Script
# Usage: ./scripts/test-api.sh [BASE_URL]
# Example: ./scripts/test-api.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
echo "Testing API at: $BASE_URL"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health check
echo -e "\n${YELLOW}1. Health Check${NC}"
HEALTH=$(curl -s "${BASE_URL}/health")
echo "Response: $HEALTH"
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi

# Test 2: Get categories
echo -e "\n${YELLOW}2. Get Categories${NC}"
CATEGORIES=$(curl -s "${BASE_URL}/v1/catalog/categories")
echo "Response: $CATEGORIES"

# Test 3: Register a user and create a group
echo -e "\n${YELLOW}3. Register User + Create Group${NC}"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User\",
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"password123\",
    \"city\": \"Riyadh\",
    \"mode\": \"create_tenant\",
    \"groupName\": \"Test Group ${TIMESTAMP}\"
  }")
echo "Response: $REGISTER_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
TENANT_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ Registration failed - no token received${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Registration successful${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo "Tenant ID: $TENANT_ID"

# Test 4: Get current user
echo -e "\n${YELLOW}4. Get Current User${NC}"
USER_RESPONSE=$(curl -s "${BASE_URL}/v1/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $USER_RESPONSE"

# Test 5: Get tenant info
echo -e "\n${YELLOW}5. Get Tenant Info${NC}"
TENANT_RESPONSE=$(curl -s "${BASE_URL}/v1/tenants/$TENANT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $TENANT_RESPONSE"

# Extract join code
JOIN_CODE=$(echo "$TENANT_RESPONSE" | grep -o '"joinCode":"[^"]*"' | cut -d'"' -f4)
echo "Join Code: $JOIN_CODE"

# Test 6: Get members
echo -e "\n${YELLOW}6. Get Group Members${NC}"
MEMBERS_RESPONSE=$(curl -s "${BASE_URL}/v1/tenants/$TENANT_ID/members" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $MEMBERS_RESPONSE"

# Test 7: Suggest a place
echo -e "\n${YELLOW}7. Suggest a Place${NC}"
PLACE_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/tenants/$TENANT_ID/places" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Shawarmer Exit 6",
    "category": "EATING",
    "description": "Best shawarma in town"
  }')
echo "Response: $PLACE_RESPONSE"

PLACE_ID=$(echo "$PLACE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Place ID: $PLACE_ID"

# Test 8: List places
echo -e "\n${YELLOW}8. List Places${NC}"
PLACES_RESPONSE=$(curl -s "${BASE_URL}/v1/tenants/$TENANT_ID/places" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $PLACES_RESPONSE"

# Test 9: Spin the roulette
echo -e "\n${YELLOW}9. Spin the Roulette${NC}"
SPIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/tenants/$TENANT_ID/spins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "type": "GROUP_SUGGESTED",
    "category": "EATING",
    "excludedItemKeys": []
  }')
echo "Response: $SPIN_RESPONSE"

# Test 10: Register second user and join by code
echo -e "\n${YELLOW}10. Register Second User + Join by Code${NC}"
TIMESTAMP2=$(date +%s)
REGISTER2_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User 2\",
    \"email\": \"test2_${TIMESTAMP2}@example.com\",
    \"password\": \"password123\",
    \"city\": \"Jeddah\",
    \"mode\": \"join_by_code\",
    \"joinCode\": \"$JOIN_CODE\"
  }")
echo "Response: $REGISTER2_RESPONSE"

if echo "$REGISTER2_RESPONSE" | grep -q "access"; then
    echo -e "${GREEN}✓ Second user joined successfully${NC}"
else
    echo -e "${RED}✗ Join by code failed${NC}"
fi

# Test 11: Login
echo -e "\n${YELLOW}11. Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"password123\"
  }")
echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "access"; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}================================${NC}"

