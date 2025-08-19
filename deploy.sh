#!/bin/bash

# Production Build and Test Script for Flunks Deployment

echo "🚀 Flunks Production Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Flunks project root directory"
    exit 1
fi

echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🎯 Next Steps for Deployment:"
echo ""
echo "1. 🌐 VERCEL DEPLOYMENT (Recommended):"
echo "   npm install -g vercel"
echo "   vercel --prod"
echo "   # Then add flunks.net domain in Vercel dashboard"
echo ""
echo "2. 🔧 MANUAL DEPLOYMENT:"
echo "   # Upload .next folder to your hosting provider"
echo "   # Configure environment variables from .env.production"
echo ""
echo "3. 🔐 ACCESS CONTROL:"
echo "   # Access codes are configured in backend API"
echo "   # Set NEXT_PUBLIC_ACCESS_REQUIRED=false to disable gate"
echo ""
echo "4. 🧪 TEST ACCESS VALIDATION:"
echo "   node scripts/check-access-codes.js --test-api"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"

# Optional: Start production server locally for testing
read -p "🔥 Start production server locally for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌟 Starting production server on http://localhost:3000"
    echo "💡 This will show the access gate (since it's not localhost:3004)"
    npm start
fi
