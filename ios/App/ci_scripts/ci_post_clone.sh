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

# Fix Package.swift to use remote URLs instead of local node_modules paths
# This is necessary because Xcode Cloud resolves packages before our script runs
echo "🔧 Fixing Package.swift for Xcode Cloud..."
cat > "$CI_PRIMARY_REPOSITORY_PATH/ios/App/CapApp-SPM/Package.swift" << 'EOF'
// swift-tools-version: 5.9
import PackageDescription

// Modified for Xcode Cloud compatibility - uses remote packages instead of local node_modules
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.1"),
        .package(url: "https://github.com/nicklockwood/SwiftFormat", from: "0.54.0")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ]
        )
    ]
)
EOF

echo "✅ Pre-build setup complete!"
