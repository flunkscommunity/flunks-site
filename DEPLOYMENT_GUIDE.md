# 🚀 Beta Launch Deployment Guide

## 🎯 Two-Environment Setup Complete!

You now have a perfect setup for launching your beta while keeping development tools available:

### **Production Branch** (`production`) - Live Beta Site
- ✅ **Clean user experience** - no admin tools visible
- ✅ **School hover fixed** - now shows 300x300 icon
- ✅ **Transparent boxes removed** - clean map experience  
- ✅ **GUM system working** - daily rewards functional
- ✅ **Ready for beta testers**

### **Development Branch** (`main`) - Admin & Testing
- 🔧 **Full admin access** - GUM admin panel (Ctrl+G)
- 🔧 **Time configuration** - Day/night admin (Ctrl+T)
- 🔧 **Debug endpoints** - All testing APIs available
- 🔧 **Development tools** - Scripts and diagnostics

## 🌐 Deployment Strategy

### **Recommended Setup:**

### **Recommended Setup:**

**Live Site (flunks.net):**
```bash
# Deploy production branch
git checkout production
vercel --prod --branch production
# Point flunks.net to this deployment
```

**Dev Site (dev.flunks.net):**
```bash  
# Deploy main branch
git checkout main
vercel --alias dev.flunks.net --branch main
```

## 🔧 Quick Deploy Steps

### 1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

### 2. **Deploy Production (Live Site):**
   npm run build
   netlify deploy --prod --dir=out
   ```

2. **Configure Domain:**
   - In Netlify dashboard, add `flunks.net` as custom domain
   - Update DNS records as instructed

### **Option 3: Traditional Hosting (cPanel/etc)**

1. **Build the site:**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Upload to hosting:**
   - Upload the `out/` or `.next/` folder contents
   - Configure environment variables in hosting panel

## 🎮 Access Management

### **For Beta Testing:**
- Share access codes with your beta users
- Codes are stored in session storage (persist until browser close)
- Easy to change codes by updating environment variables

### **Going Public:**
To remove the access gate entirely:
1. Set `NEXT_PUBLIC_ACCESS_REQUIRED="false"` in production env
2. Redeploy the site

### **Adding New Access Codes:**
1. Update `NEXT_PUBLIC_BETA_ACCESS_CODES` in production environment
2. Redeploy (or use Vercel's instant environment variable updates)

## 🛠️ Pre-Deployment Checklist

- [ ] Update Supabase URLs in `.env.production`
- [ ] Verify Flow blockchain configuration for mainnet
- [ ] Test access codes work correctly
- [ ] Ensure all assets/images are properly included
- [ ] Update any hardcoded URLs to use `flunks.net`

## 🔄 Migration Process

### **From Current Site:**
1. **Backup current flunks.net content** (if any exists)
2. **Deploy new site** with access gate enabled
3. **Test thoroughly** with access codes
4. **Update DNS** to point to new deployment
5. **Share access codes** with intended users

### **Gradual Rollout:**
- Start with limited access codes for core community
- Gradually expand access as you're ready
- Remove access gate entirely when ready for public launch

## 🎯 Benefits of This Approach

✅ **Professional gating** - Clean, Windows 95-themed access screen  
✅ **Preserves all features** - Full clique access system, trial mode, etc.  
✅ **Easy management** - Control access via environment variables  
✅ **Flexible** - Can remove gate instantly when ready  
✅ **SEO friendly** - Proper meta tags and structure  
✅ **Mobile responsive** - Works on all devices  

## 🆘 Need Help?

- **Access codes not working?** Check environment variables in hosting dashboard
- **Features broken?** Verify all environment variables are set correctly
- **Domain issues?** Check DNS propagation (can take 24-48 hours)
- **Performance issues?** Consider enabling caching in your hosting provider

---

**Ready to launch! 🚀** Your Flunks 95 site will be live on `flunks.net` with professional access control maintaining the exclusivity you want.
