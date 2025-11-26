#!/bin/bash

# Script to publish shared types to GitHub Packages
# Uses GITHUB_NPM_PUBLISH_TOKEN from environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Publishing @jackdo69/job-tracker-shared-types${NC}"
echo ""

# Check if token is set
if [ -z "$GITHUB_NPM_PUBLISH_TOKEN" ]; then
    echo -e "${RED}❌ Error: GITHUB_NPM_PUBLISH_TOKEN is not set${NC}"
    echo ""
    echo "Please set the token in your ~/.zshrc:"
    echo "  export GITHUB_NPM_PUBLISH_TOKEN=your_token_here"
    echo ""
    echo "Then reload your shell:"
    echo "  source ~/.zshrc"
    exit 1
fi

echo -e "${YELLOW}🔧 Configuring npm for GitHub Packages...${NC}"

# Create temporary .npmrc for authentication
cat > .npmrc << EOF
@jackdo69:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_NPM_PUBLISH_TOKEN}
EOF

echo -e "${GREEN}✅ Authentication configured${NC}"
echo ""

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
npm run clean 2>/dev/null || true

# Build the package
echo -e "${YELLOW}🔨 Building package...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    rm -f .npmrc
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Get current version
VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📋 Publishing version: ${GREEN}${VERSION}${NC}"
echo ""

# Publish
echo -e "${YELLOW}🚀 Publishing to GitHub Packages...${NC}"
npm publish --registry=https://npm.pkg.github.com

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully published @jackdo69/job-tracker-shared-types@${VERSION}${NC}"
    echo ""
    echo -e "${GREEN}View at: https://github.com/jackdo69/job-tracker/packages${NC}"
else
    echo ""
    echo -e "${RED}❌ Publish failed${NC}"
    rm -f .npmrc
    exit 1
fi

# Clean up
rm -f .npmrc

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
