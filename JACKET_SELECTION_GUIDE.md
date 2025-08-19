# Jacket Selection System - File Upload Guide

## 📁 **Upload Your Images Here:**

```
/public/images/jackets/
├── jacket-classic.png    ← Upload your first jacket image here
└── jacket-retro.png     ← Upload your second jacket image here
```

## 🎨 **Image Specifications:**

### **Recommended Size:**
- **Width:** 120px
- **Height:** 140px  
- **Format:** PNG with transparent background
- **Style:** Designed to fit the jacket container shape (rounded top, rectangular bottom)

### **Design Guidelines:**
- Should complement the blue/gold Flunks color scheme
- Consider the rounded jacket container shape (60px radius on top)
- Leave space for the "F" letter overlay if needed
- Transparent background works best for layering

## 🔧 **Current Implementation:**

### **Features Added:**
✅ Left/Right arrow navigation buttons
✅ Jacket name and description display
✅ Selection indicator dots  
✅ Keyboard controls (← → arrows when in section 2)
✅ Smooth transitions and hover effects
✅ Fallback to current design if images aren't loaded

### **User Experience:**
1. User scrolls to Section 2 (Letter Jacket)
2. Can click left/right arrows or use keyboard arrows
3. Jacket image, name, and description update
4. Selection dots show current choice
5. Smooth animations and visual feedback

### **Files Modified:**
- `src/windows/LockerSystemNew.tsx` - Added jacket selection interface
- `/public/images/jackets/` - Directory created for jacket images

## 🚀 **Next Steps:**
1. Upload your 2 jacket images to `/public/images/jackets/`
2. Name them `jacket-classic.png` and `jacket-retro.png`
3. Test the selection interface in the My Locker app
4. Optionally add more jacket options by updating the `jacketOptions` array

The system is ready for your jacket images! 👕✨
