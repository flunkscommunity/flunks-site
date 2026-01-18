#!/bin/sh

# Xcode Cloud post-clone script
# This runs after the repository is cloned but before the build starts

echo "📦 Installing Node.js dependencies..."

# Navigate to the project root (repository root)
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Check Node version
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Install dependencies
npm ci

# Build the web app for Capacitor
echo "🔨 Building web app..."
MOBILE_BUILD=true npm run build

# Sync Capacitor
echo "📱 Syncing Capacitor..."
npx cap sync ios

echo "✅ Pre-build setup complete!"
