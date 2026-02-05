#!/bin/bash
# Android build script - trims and replaces assets to get under 200MB
# Run from project root: ./deployment-scripts/trim-mobile-assets.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ANDROID_ASSETS="$PROJECT_DIR/android/app/src/main/assets/public"
COMPRESSED_ASSETS="$SCRIPT_DIR/android-compressed-assets"

cd "$PROJECT_DIR"

echo "📱 Android Build Script"
echo "========================"

# Step 1: Build
echo ""
echo "🔨 Building Next.js..."
MOBILE_BUILD=true npm run build

# Step 2: Sync
echo ""
echo "🔄 Syncing to Android..."
npx cap sync android

# Step 3: Replace with compressed assets
echo ""
echo "🗜️  Replacing with compressed assets..."

if [ -d "$COMPRESSED_ASSETS" ]; then
    # Replace locations (151MB -> 33MB)
    if [ -d "$COMPRESSED_ASSETS/images/locations" ]; then
        echo "  - Replacing locations/..."
        rm -rf "$ANDROID_ASSETS/images/locations"
        cp -R "$COMPRESSED_ASSETS/images/locations" "$ANDROID_ASSETS/images/"
    fi

    # Replace icons (93MB -> 27MB)
    if [ -d "$COMPRESSED_ASSETS/images/icons" ]; then
        echo "  - Replacing icons/..."
        rm -rf "$ANDROID_ASSETS/images/icons"
        cp -R "$COMPRESSED_ASSETS/images/icons" "$ANDROID_ASSETS/images/"
    fi

    # Replace backdrops
    if [ -d "$COMPRESSED_ASSETS/images/backdrops" ]; then
        echo "  - Replacing backdrops/..."
        rm -rf "$ANDROID_ASSETS/images/backdrops"
        cp -R "$COMPRESSED_ASSETS/images/backdrops" "$ANDROID_ASSETS/images/"
    fi

    # Replace backgrounds
    if [ -d "$COMPRESSED_ASSETS/images/backgrounds" ]; then
        echo "  - Replacing backgrounds/..."
        rm -rf "$ANDROID_ASSETS/images/backgrounds"
        cp -R "$COMPRESSED_ASSETS/images/backgrounds" "$ANDROID_ASSETS/images/"
    fi

    # Replace audio (48MB -> 12MB)
    if [ -d "$COMPRESSED_ASSETS/audio" ]; then
        echo "  - Replacing audio/..."
        rm -rf "$ANDROID_ASSETS/audio"
        cp -R "$COMPRESSED_ASSETS/audio" "$ANDROID_ASSETS/"
    fi

    # Replace Games (29MB -> 5MB)
    if [ -d "$COMPRESSED_ASSETS/Games" ]; then
        echo "  - Replacing Games/..."
        rm -rf "$ANDROID_ASSETS/Games"
        cp -R "$COMPRESSED_ASSETS/Games" "$ANDROID_ASSETS/"
    fi
else
    echo "⚠️  Warning: Compressed assets not found at $COMPRESSED_ASSETS"
fi

# Step 4: Remove unnecessary folders
echo ""
echo "🗑️  Removing unnecessary folders..."
rm -rf "$ANDROID_ASSETS/images/jackets" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/images/about-us" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/images/profiles" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/music" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/3d" 2>/dev/null || true

# Remove duplicate folders
rm -rf "$ANDROID_ASSETS/cards 2" "$ANDROID_ASSETS/cards 3" "$ANDROID_ASSETS/slots 2" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/3d 2" "$ANDROID_ASSETS/audio 2" "$ANDROID_ASSETS/sounds 2" 2>/dev/null || true
rm -rf "$ANDROID_ASSETS/skins 2" "$ANDROID_ASSETS/music 2" 2>/dev/null || true

echo ""
echo "📊 Final Android assets size:"
du -sh "$ANDROID_ASSETS"

echo ""
echo "✅ Done! Run: cd android && ./gradlew bundleRelease"
