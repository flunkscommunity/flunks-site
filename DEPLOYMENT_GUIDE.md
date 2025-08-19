# 🚀 Deployment Guide: Moving to flunks.net

## 🎯 Overview

This guide covers deploying your Flunks 95 site to `flunks.net` while maintaining the access control you want to preserve.

## 🔐 Access Control Strategy

I've implemented a **Beta Access Gate** that:

- ✅ **Blocks unauthorized users** with a professional access code screen
- ✅ **Preserves all your existing features** once access is granted
- ✅ **Works in development** (localhost bypasses the gate automatically)
- ✅ **Easy to manage** via backend API and secure validation

### Access Control:
- Access codes are configured in backend API
- Multiple access levels supported (Admin, Beta, Community)
- Contact admin for access codes

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended)** ⭐

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   cd /Users/jeremy/Desktop/flunks-site
   vercel
   ```

2. **Configure Domain:**
   - In Vercel dashboard, go to your project settings
   - Add `flunks.net` as a custom domain
   - Update your domain's DNS to point to Vercel

3. **Environment Variables:**
   - Copy variables from `.env.production` to Vercel dashboard
   - Go to Project Settings → Environment Variables
   - Add each variable from the production env file

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### **Option 2: Netlify**

1. **Build and Deploy:**
   ```bash
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
