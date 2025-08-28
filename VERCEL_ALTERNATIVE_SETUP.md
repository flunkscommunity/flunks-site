# 🌿 Alternative: Git Branch-Based Deployment

If you prefer using **git branches** instead of two separate Vercel projects:

## 🎯 Branch Strategy

### 1. Create Branches
```bash
# Create public branch (for flunks.net)
git checkout -b public
git push -u origin public

# Create build branch (for build.flunks.net) 
git checkout -b build
git push -u origin build
```

### 2. Configure Vercel Projects

#### Public Site:
- **Project:** flunks-public
- **Domain:** flunks.net
- **Git Branch:** public
- **Environment:**
  ```
  NEXT_PUBLIC_BUILD_MODE=public
  NEXT_PUBLIC_ACCESS_REQUIRED=true
  ```

#### Build Site:
- **Project:** flunks-build  
- **Domain:** build.flunks.net
- **Git Branch:** build
- **Environment:**
  ```
  NEXT_PUBLIC_BUILD_MODE=build
  NEXT_PUBLIC_ACCESS_REQUIRED=true
  ```

### 3. Workflow
```bash
# Work on main branch
git checkout main
# Make changes...

# Deploy to public when ready
git checkout public
git merge main
git push

# Deploy to build for testing
git checkout build  
git merge main
git push

# Back to main for development
git checkout main
```

## 🎯 Recommendation

**Use the two-project approach** (same repo, different Vercel projects) because:
- ✅ Simpler workflow
- ✅ Same codebase 
- ✅ Environment variables control everything
- ✅ No git branch management needed

The environment variables (`NEXT_PUBLIC_BUILD_MODE`) handle all the feature differences automatically!
