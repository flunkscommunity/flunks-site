#!/bin/bash

# Deploy Build Mode (build.flunks.net)
# This is your private development environment with all features

echo "🔧 Deploying Flunks BUILD MODE to build.flunks.net"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Flunks project root directory"
    exit 1
fi

echo "📦 Building development version..."
npm run build:build-mode

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build mode successful!"

echo ""
echo "🎯 Build Mode Features:"
echo "  • ✅ ALL applications visible"
echo "  • ✅ Semester Zero, Meme Manager, MyPlace"
echo "  • ✅ Flappy Flunk, Yearbook, Icon Animation"
echo "  • ✅ Admin panels (Ctrl+G, Ctrl+T)"
echo "  • ✅ Debug endpoints and dev tools"
echo "  • 🔐 Private access - only you can see this"
echo ""

echo "🚀 Next Steps:"
echo "1. Deploy to build.flunks.net:"
echo "   vercel --prod"
echo "2. Set up separate Vercel project for build mode"
echo "3. Configure environment variables:"
echo "   NEXT_PUBLIC_BUILD_MODE=build"
echo "   NEXT_PUBLIC_ACCESS_REQUIRED=true"
echo ""
echo "💡 This is your private playground to test all features!"
