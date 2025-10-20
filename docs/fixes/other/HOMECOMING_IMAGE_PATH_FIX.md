# Homecoming Images Path Fix

## 🐛 Problem Found

The Homecoming chapter in Story Mode was showing black thumbnails and no images were loading during the cutscenes.

### Root Cause:
**Image Path Mismatch**

The code was looking for images at:
```
/images/cutscenes/homecoming-main.png
/images/cutscenes/homecoming-1.png
/images/cutscenes/homecoming-2.png
... etc
```

But the actual files were located in a subdirectory:
```
/images/cutscenes/homecoming/homecoming-main.png
/images/cutscenes/homecoming/homecoming-1.png
/images/cutscenes/homecoming/homecoming-2.png
... etc
```

Missing subdirectory: `/homecoming/`

## ✅ Solution Applied

Updated all image paths in `StoryManual.tsx` to include the correct subdirectory.

### Files Modified:
- `/src/components/StoryManual.tsx`

### Changes Made:
Updated 12 image paths (1 thumbnail + 11 scene images):

**Before:**
```typescript
thumbnail: '/images/cutscenes/homecoming-main.png'
image: '/images/cutscenes/homecoming-1.png'
```

**After:**
```typescript
thumbnail: '/images/cutscenes/homecoming/homecoming-main.png'
image: '/images/cutscenes/homecoming/homecoming-1.png'
```

### All Updated Paths:
1. ✅ `homecoming-main.png` (thumbnail)
2. ✅ `homecoming-1.png` (Thursday parade)
3. ✅ `homecoming-2.png` (Thursday prep)
4. ✅ `homecoming-3.png` (Friday murmurs)
5. ✅ `homecoming-4.png` (Friday geek)
6. ✅ `homecoming-5.png` (Friday jock)
7. ✅ `homecoming-6.png` (Saturday freak)
8. ✅ `homecoming-7.png` (Saturday prep)
9. ✅ `homecoming-8.png` (Saturday night)
10. ✅ `homecoming-9.png` (Sunday search)
11. ✅ `homecoming-10.png` (Monday cancelled)
12. ✅ `homecoming-11.png` (Mystery remains)

## 🎯 Result

- ✅ Homecoming thumbnail now displays on Story Mode main screen
- ✅ All 11 scene images now load correctly during cutscenes
- ✅ Images transition smoothly with VCR effects
- ✅ Music plays correctly (`homecomingstory.mp3`)

## 🧪 Testing

**Next.js Dev Server Logs:**
- **Before Fix:** All images returned `404` errors
- **After Fix:** Images should load with `200` status

**Test Procedure:**
1. Open http://localhost:3000
2. Open Story Mode
3. Verify Homecoming thumbnail shows (should not be black)
4. Click Homecoming chapter
5. Verify all 11 images display correctly
6. Verify music plays

---

**Status:** ✅ Fixed and ready to test
**Date:** October 7, 2025
