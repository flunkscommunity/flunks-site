#!/bin/bash

# Deploy Public Mode (flunks.net)
# This is what beta users will see - limited feature set

echo "🌐 Deploying Flunks PUBLIC MODE to flunks.net"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Flunks project root directory"
    exit 1
fi

echo "📦 Building public version..."
npm run build:public

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Public build successful!"

echo ""
echo "🎯 Public Mode Features:"
echo "  • Beta user access with limited app set"
echo "  • OnlyFlunks, Profile, Radio, Chat, About"
echo "  • Discord, X, Market, FHS School"
echo "  • Game Manual, Terminal, Clique Access"
echo "  • 🚫 NO Semester Zero, Meme Manager, MyPlace, Flappy Flunk"
echo ""

echo "🚀 Next Steps:"
echo "1. Deploy to flunks.net:"
echo "   vercel --prod"
echo "2. Verify environment variables in Vercel dashboard:"
echo "   NEXT_PUBLIC_BUILD_MODE=public"
echo "   NEXT_PUBLIC_ACCESS_REQUIRED=true"
echo ""
echo "💡 This build is perfect for beta testers!"
