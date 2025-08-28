#!/bin/bash

# Quick Deploy Script - Deploy to specific site only
# Usage: ./quick-deploy.sh [public|build]

if [ "$1" = "public" ]; then
    echo "🚀 Deploying only to PUBLIC site (flunks.net)..."
    # This will only trigger the public Vercel project
    git push origin main:public-deploy
elif [ "$1" = "build" ]; then
    echo "🔧 Deploying only to BUILD site (build.flunks.net)..."  
    # This will only trigger the build Vercel project
    git push origin main:build-deploy
else
    echo "❓ Usage: ./quick-deploy.sh [public|build]"
    echo "  public - Deploy only to flunks.net"
    echo "  build  - Deploy only to build.flunks.net"
    exit 1
fi
