# Secure Dev Environment Setup

## 🔐 Environment Variables for Each Site:

### **Production Site (flunks.net):**
```env
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
# No access codes needed - open to everyone!
```

### **Dev Site (dev.flunks.net):**
```env
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=development
# Admin access for you only
```

## 🎯 Result:
- **flunks.net**: Open to everyone - no access code required
- **dev.flunks.net**: Admin access with code "flunks2025"
- **Localhost**: Always works for development

## 🔑 Your Dev Access:
1. Go to dev.flunks.net
2. Enter: `flunks2025` 
3. Get full admin access with:
   - Ctrl+G: GUM admin panel
   - Ctrl+T: Time configuration admin
   - All debug tools and APIs
   - Full site functionality

## 🚀 When Ready to Deploy:
- **Production branch**: Clean user experience (no admin panels)
- **Main branch**: Full admin experience for dev site
- Both configured and ready when you give the go-ahead!
