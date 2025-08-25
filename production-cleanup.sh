#!/bin/bash
# Production cleanup script - removes admin/debug features for live deployment

echo "🧹 Cleaning up for production deployment..."

# Remove test/debug files
echo "📁 Removing test and debug files..."
rm -f test-*.js
rm -f debug-*.js  
rm -f *-diagnostic*.js
rm -f *-test*.js
rm -f wallet-*.js
rm -f browser-*.js
rm -f emergency-*.js
rm -f fix-*.js
rm -f semester-zero-*.js
rm -f targeted-*.js
rm -f direct-*.js
rm -f gum-diagnostic.js
rm -f reset-*.js
rm -f disable-*.js
rm -f *.sql
rm -f *.md
rm -f add-map-icons.sh

# Remove API debug endpoints
echo "🔧 Removing debug API endpoints..."
rm -f src/pages/api/debug-*.ts
rm -f src/pages/api/test-*.ts
rm -f src/pages/api/*-admin.ts

# Remove development logs
rm -f *.log
rm -f *.html

echo "✅ Production cleanup complete!"
echo ""
echo "🚀 Ready for deployment!"
echo "Next steps:"
echo "1. Test the production build: npm run build"
echo "2. Deploy to your hosting platform"
echo "3. Set up dev environment on separate subdomain"
