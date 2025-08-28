#!/bin/bash

# Vercel Deployment Setup Guide
echo "🚀 Setting up Flunks Two-Mode Deployment in Vercel"
echo "=================================================="

echo ""
echo "📋 STEP-BY-STEP VERCEL SETUP:"
echo ""

echo "1️⃣ CREATE PUBLIC SITE (flunks.net):"
echo "   • Go to https://vercel.com/new"
echo "   • Import your GitHub repo: flunkscommunity/flunks-site"
echo "   • Project name: 'flunks-public'"
echo "   • Deploy"
echo ""

echo "2️⃣ SET PUBLIC ENVIRONMENT VARIABLES:"
echo "   In Vercel Dashboard > Settings > Environment Variables:"
echo "   ----------------------------------------"
echo "   NEXT_PUBLIC_BUILD_MODE = public"
echo "   NEXT_PUBLIC_ACCESS_REQUIRED = false"
echo "   NEXT_PUBLIC_ORIGIN = https://flunks.net"
echo "   (Copy all other vars from .env.production)"
echo ""

echo "3️⃣ ADD CUSTOM DOMAIN:"
echo "   • Vercel Dashboard > Settings > Domains"
echo "   • Add: flunks.net"
echo "   • Configure DNS records as instructed"
echo ""

echo "4️⃣ CREATE BUILD SITE (build.flunks.net):"
echo "   • Go to https://vercel.com/new AGAIN"
echo "   • Import SAME GitHub repo: flunkscommunity/flunks-site"
echo "   • Project name: 'flunks-build'"
echo "   • Deploy"
echo ""

echo "5️⃣ SET BUILD ENVIRONMENT VARIABLES:"
echo "   In Vercel Dashboard > Settings > Environment Variables:"
echo "   ----------------------------------------"
echo "   NEXT_PUBLIC_BUILD_MODE = build"
echo "   NEXT_PUBLIC_ACCESS_REQUIRED = true"
echo "   NEXT_PUBLIC_ORIGIN = https://build.flunks.net"
echo "   (Copy all other vars from .env.build)"
echo ""

echo "6️⃣ ADD BUILD DOMAIN:"
echo "   • Vercel Dashboard > Settings > Domains"
echo "   • Add: build.flunks.net"
echo "   • Configure DNS records as instructed"
echo ""

echo "✅ RESULT:"
echo "   • flunks.net = Open access, clean user experience (no login!)"
echo "   • build.flunks.net = Your full development environment (requires login)"
echo ""

echo "🔧 ALTERNATIVE - Single Project Setup:"
echo "   You can also use branches or git-based deployment"
echo "   See VERCEL_ALTERNATIVE_SETUP.md for details"

echo ""
echo "💡 Both sites will auto-deploy when you push to GitHub!"
